
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
    factory();
})((function () { 'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    /**
     * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
     * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
     * it can be called from an external module).
     *
     * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
     *
     * https://svelte.dev/docs#run-time-svelte-onmount
     */
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    /**
     * Schedules a callback to run immediately before the component is unmounted.
     *
     * Out of `onMount`, `beforeUpdate`, `afterUpdate` and `onDestroy`, this is the
     * only one that runs inside a server-side component.
     *
     * https://svelte.dev/docs#run-time-svelte-ondestroy
     */
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    /**
     * Creates an event dispatcher that can be used to dispatch [component events](/docs#template-syntax-component-directives-on-eventname).
     * Event dispatchers are functions that can take two arguments: `name` and `detail`.
     *
     * Component events created with `createEventDispatcher` create a
     * [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).
     * These events do not [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture).
     * The `detail` argument corresponds to the [CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail)
     * property and can contain any type of data.
     *
     * https://svelte.dev/docs#run-time-svelte-createeventdispatcher
     */
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.59.2' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    let isLoadingLibrary = false;
    /**
     * The list of callbacks, one from each GooglePlacesAutocomplete instance that requested the library before the library
     * had finished loading.
     */
    const callbacks = [];
    function hasLoadedLibrary() {
        return window.google && window.google.maps && window.google.maps.places;
    }
    /**
     * Load the Google Places library and notify the calling code (if given a callback) once the library is ready.
     *
     * This supports three scenarios:
     * 1. The library hasn't been loaded yet and isn't in the process of loading yet.
     * 2. The library hasn't been loaded yet but is already in the process of loading.
     * 3. The library has already been loaded.
     *
     * In scenarios 1 and 2, any callbacks that have been provided (which could be multiple, if multiple
     * GooglePlacesAutocomplete instances are in use) will be called when the library finishes loading.
     *
     * In scenario 3, the callback will be called immediately.
     *
     * @param apiKey Your Google Places API Key
     * @param callback A callback (if you want to be notified when the library is available for use)
     */
    function loadGooglePlacesLibrary(apiKey, callback) {
        if (hasLoadedLibrary()) {
            callback();
            return;
        }
        callback && callbacks.push(callback);
        if (isLoadingLibrary) {
            return;
        }
        isLoadingLibrary = true;
        const element = document.createElement("script");
        element.async = true;
        element.defer = true;
        element.onload = onLibraryLoaded;
        element.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places`;
        element.type = "text/javascript";
        document.head.appendChild(element);
    }
    function onLibraryLoaded() {
        isLoadingLibrary = false;
        let callback;
        while ((callback = callbacks.pop())) {
            callback();
        }
    }

    /* src/location-input/googlePlace/GooglePlaceAutocomplete.svelte generated by Svelte v3.59.2 */
    const file$2 = "src/location-input/googlePlace/GooglePlaceAutocomplete.svelte";

    function create_fragment$2(ctx) {
    	let input;
    	let input_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "class", input_class_value = /*$$props*/ ctx[7].class);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			input.value = /*value*/ ctx[1];
    			input.required = /*required*/ ctx[2];
    			attr_dev(input, "pattern", /*pattern*/ ctx[3]);
    			toggle_class(input, "input", true);
    			add_location(input, file$2, 93, 0, 3467);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			/*input_binding*/ ctx[11](input);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*onChange*/ ctx[5], false, false, false, false),
    					listen_dev(input, "keydown", /*onKeyDown*/ ctx[6], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$$props*/ 128 && input_class_value !== (input_class_value = /*$$props*/ ctx[7].class)) {
    				attr_dev(input, "class", input_class_value);
    			}

    			if (dirty & /*placeholder*/ 1) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[0]);
    			}

    			if (dirty & /*value*/ 2 && input.value !== /*value*/ ctx[1]) {
    				prop_dev(input, "value", /*value*/ ctx[1]);
    			}

    			if (dirty & /*required*/ 4) {
    				prop_dev(input, "required", /*required*/ ctx[2]);
    			}

    			if (dirty & /*pattern*/ 8) {
    				attr_dev(input, "pattern", /*pattern*/ ctx[3]);
    			}

    			if (dirty & /*$$props*/ 128) {
    				toggle_class(input, "input", true);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*input_binding*/ ctx[11](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let selectedLocationName;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('GooglePlaceAutocomplete', slots, []);
    	let { apiKey } = $$props;
    	let { options = undefined } = $$props;
    	let { placeholder = undefined } = $$props;
    	let { value = "" } = $$props;
    	let { required = false } = $$props;
    	let { pattern = "" } = $$props;
    	let { onSelect } = $$props;
    	const dispatch = createEventDispatcher();
    	let inputField;

    	onMount(() => {
    		loadGooglePlacesLibrary(apiKey, () => {
    			$$invalidate(8, options["types"] = ["street_address", "premise", "subpremise", "point_of_interest"], options);
    			const autocomplete = new google.maps.places.Autocomplete(inputField, Object.assign({}, options));

    			autocomplete.addListener("place_changed", () => {
    				const place = autocomplete.getPlace();

    				// There are circumstances where the place_changed event fires, but we
    				// were NOT given location data. I only want to propagate the event if we
    				// truly received location data from Google.
    				// See the `Type something, no suggestions, hit Enter` test case.
    				if (hasLocationData(place)) {
    					onSelect(place);
    					setSelectedLocation({ place, text: inputField.value });
    				}
    			});

    			dispatch("ready");

    			setTimeout(
    				() => {
    					inputField.setAttribute("autocomplete", "one-time-code");
    				},
    				2000
    			);
    		});
    	});

    	function emptyLocationField() {
    		$$invalidate(4, inputField.value = "", inputField);
    		onChange();
    	}

    	function hasLocationData(place) {
    		const fieldsToLookFor = options && options.fields || ["geometry"];
    		return place.hasOwnProperty(fieldsToLookFor[0]);
    	}

    	function onChange() {
    		if (inputField.value === "") {
    			setSelectedLocation(null);
    		}
    	}

    	function onKeyDown(event) {
    		const suggestionsAreVisible = document.getElementsByClassName("pac-item").length;

    		if (event.key === "Enter" || event.key === "Tab") {
    			if (suggestionsAreVisible) {
    				const isSuggestionSelected = document.getElementsByClassName("pac-item-selected").length;

    				if (!isSuggestionSelected) {
    					selectFirstSuggestion();
    				}
    			} else if (doesNotMatchSelectedLocation(inputField.value)) {
    				setTimeout(emptyLocationField, 10);
    			}
    		} else if (event.key === "Escape") {
    			setTimeout(emptyLocationField, 10);
    		}

    		if (suggestionsAreVisible) {
    			if (event.key === "Enter") {
    				/* When suggestions are visible, don't let an 'Enter' submit a form (since
     * the user is interacting with the list of suggestions at the time, not
     * expecting their actions to affect the form as a whole). */
    				event.preventDefault();
    			}
    		}
    	}

    	function selectFirstSuggestion() {
    		// Simulate the 'down arrow' key in order to select the first suggestion:
    		// https://developer.mozilla.org/en-US/docs/Web/Guide/Events/Creating_and_triggering_events
    		const simulatedEvent = new KeyboardEvent("keydown",
    		{
    				key: "ArrowDown",
    				code: "ArrowDown",
    				keyCode: 40
    			});

    		inputField.dispatchEvent(simulatedEvent);
    	}

    	function setSelectedLocation(data) {
    		selectedLocationName = data && data.text || "";
    		dispatch("place_changed", data);
    	}

    	function doesNotMatchSelectedLocation(value) {
    		return selectedLocationName !== value;
    	}

    	$$self.$$.on_mount.push(function () {
    		if (apiKey === undefined && !('apiKey' in $$props || $$self.$$.bound[$$self.$$.props['apiKey']])) {
    			console.warn("<GooglePlaceAutocomplete> was created without expected prop 'apiKey'");
    		}

    		if (onSelect === undefined && !('onSelect' in $$props || $$self.$$.bound[$$self.$$.props['onSelect']])) {
    			console.warn("<GooglePlaceAutocomplete> was created without expected prop 'onSelect'");
    		}
    	});

    	function input_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputField = $$value;
    			$$invalidate(4, inputField);
    		});
    	}

    	$$self.$$set = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ('apiKey' in $$new_props) $$invalidate(9, apiKey = $$new_props.apiKey);
    		if ('options' in $$new_props) $$invalidate(8, options = $$new_props.options);
    		if ('placeholder' in $$new_props) $$invalidate(0, placeholder = $$new_props.placeholder);
    		if ('value' in $$new_props) $$invalidate(1, value = $$new_props.value);
    		if ('required' in $$new_props) $$invalidate(2, required = $$new_props.required);
    		if ('pattern' in $$new_props) $$invalidate(3, pattern = $$new_props.pattern);
    		if ('onSelect' in $$new_props) $$invalidate(10, onSelect = $$new_props.onSelect);
    	};

    	$$self.$capture_state = () => ({
    		loadGooglePlacesLibrary,
    		createEventDispatcher,
    		onMount,
    		apiKey,
    		options,
    		placeholder,
    		value,
    		required,
    		pattern,
    		onSelect,
    		dispatch,
    		inputField,
    		emptyLocationField,
    		hasLocationData,
    		onChange,
    		onKeyDown,
    		selectFirstSuggestion,
    		setSelectedLocation,
    		doesNotMatchSelectedLocation,
    		selectedLocationName
    	});

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(7, $$props = assign(assign({}, $$props), $$new_props));
    		if ('apiKey' in $$props) $$invalidate(9, apiKey = $$new_props.apiKey);
    		if ('options' in $$props) $$invalidate(8, options = $$new_props.options);
    		if ('placeholder' in $$props) $$invalidate(0, placeholder = $$new_props.placeholder);
    		if ('value' in $$props) $$invalidate(1, value = $$new_props.value);
    		if ('required' in $$props) $$invalidate(2, required = $$new_props.required);
    		if ('pattern' in $$props) $$invalidate(3, pattern = $$new_props.pattern);
    		if ('onSelect' in $$props) $$invalidate(10, onSelect = $$new_props.onSelect);
    		if ('inputField' in $$props) $$invalidate(4, inputField = $$new_props.inputField);
    		if ('selectedLocationName' in $$props) selectedLocationName = $$new_props.selectedLocationName;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 2) {
    			selectedLocationName = value || "";
    		}
    	};

    	$$props = exclude_internal_props($$props);

    	return [
    		placeholder,
    		value,
    		required,
    		pattern,
    		inputField,
    		onChange,
    		onKeyDown,
    		$$props,
    		options,
    		apiKey,
    		onSelect,
    		input_binding
    	];
    }

    class GooglePlaceAutocomplete extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			apiKey: 9,
    			options: 8,
    			placeholder: 0,
    			value: 1,
    			required: 2,
    			pattern: 3,
    			onSelect: 10
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GooglePlaceAutocomplete",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get apiKey() {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set apiKey(value) {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pattern() {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pattern(value) {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onSelect() {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onSelect(value) {
    		throw new Error("<GooglePlaceAutocomplete>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const parsePlaceResult = (place) => {
        console.log("Parsing place result:", place);
        const addressComponentsByType = (place.address_components || []).reduce(function (acc, data) {
            data.types.forEach(function (type) {
                acc[type] = data;
            });
            return acc;
        }, {});
        console.log("Address components by type:", addressComponentsByType);
        const placeGet = (key, short = false) => {
            if (!(key in addressComponentsByType)) {
                console.log(`Missing address component: ${key}`);
                return null;
            }
            return short
                ? addressComponentsByType[key].short_name
                : addressComponentsByType[key].long_name;
        };
        // Try different component types for street number
        const houseNumber = placeGet("street_number") || placeGet("subpremise") || placeGet("premise");
        // Try different component types for street
        const street = placeGet("route") || placeGet("street_address") || placeGet("premise");
        // Try different component types for postal code
        const postalCode = placeGet("postal_code") || placeGet("postal_code_prefix");
        const result = {
            title: place.name,
            formattedAddress: place.formatted_address,
            externalId: place.place_id,
            externalUrl: place.url,
            houseNumber,
            street,
            street_2: [placeGet("floor"), placeGet("subpremise")]
                .filter((item) => !!item)
                .join(",") || null,
            city: placeGet("locality") ||
                placeGet("sublocality") ||
                placeGet("sublocality_level_1") ||
                placeGet("neighborhood") ||
                placeGet("administrative_area_level_3") ||
                placeGet("administrative_area_level_2"),
            county: placeGet("administrative_area_level_2"),
            stateShort: placeGet("administrative_area_level_1", true),
            stateLong: placeGet("administrative_area_level_1"),
            countryCode: placeGet("country", true),
            countryLong: placeGet("country"),
            postalCode,
        };
        console.log("Parsed result:", result);
        return result;
    };

    const displayNone = (el) => {
        el.style.display = "none";
    };
    const displayBlock = (el, display = "block") => {
        el.style.display = display;
    };
    function fadeIn(element, display = "block") {
        let op = 0.1; // initial opacity
        element.style.opacity = "0";
        element.style.display = display;
        const timer = setInterval(function () {
            if (op >= 1) {
                clearInterval(timer);
            }
            element.style.opacity = `${op}`;
            element.style.filter = "alpha(opacity=" + op * 100 + ")";
            op += op * 0.3;
        }, 1);
    }
    function fadeOut(element) {
        let op = 1; // initial opacity
        const timer = setInterval(function () {
            if (op <= 0.1) {
                clearInterval(timer);
                element.style.display = "none";
            }
            element.style.opacity = `${op}`;
            element.style.filter = "alpha(opacity=" + op * 100 + ")";
            op -= op * 0.3;
        }, 1);
    }

    // exchanging data with initialized HS form is hard, creating some window vars here
    const createWindowState = (key) => ({
        update: (data) => {
            try {
                window[key] = Object.assign(Object.assign({}, window[key]), data);
            }
            catch (e) { }
        },
        get: () => {
            try {
                return window[key];
            }
            catch (_a) {
                return {};
            }
        },
    });
    const addressState = createWindowState("addressState");
    const windowVars = {
        hubspotAddressData: null,
    };

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }

    /* src/location-input/LocationInput.svelte generated by Svelte v3.59.2 */

    const { console: console_1 } = globals;
    const file$1 = "src/location-input/LocationInput.svelte";

    // (121:2) {#if inputErrorMessage}
    function create_if_block(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*inputErrorMessage*/ ctx[4]);
    			attr_dev(p, "class", "preorder-address-error-message");
    			add_location(p, file$1, 121, 4, 4317);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*inputErrorMessage*/ 16) set_data_dev(t, /*inputErrorMessage*/ ctx[4]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(121:2) {#if inputErrorMessage}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div1;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let googleplaceautocomplete;
    	let t1;
    	let button;
    	let t2;
    	let t3;
    	let t4;
    	let div2;
    	let current;
    	let mounted;
    	let dispose;

    	googleplaceautocomplete = new GooglePlaceAutocomplete({
    			props: {
    				class: "location-search-input",
    				apiKey: /*googlePublicApiKey*/ ctx[0],
    				placeholder: "Enter home address",
    				onSelect: /*func*/ ctx[8],
    				options: {
    					componentRestrictions: { country: "us" },
    					types: ["address"],
    					fields: ["address_components", "formatted_address", "name", "place_id", "url"]
    				}
    			},
    			$$inline: true
    		});

    	let if_block = /*inputErrorMessage*/ ctx[4] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			create_component(googleplaceautocomplete.$$.fragment);
    			t1 = space();
    			button = element("button");
    			t2 = text(/*addressCtaText*/ ctx[1]);
    			t3 = space();
    			if (if_block) if_block.c();
    			t4 = space();
    			div2 = element("div");
    			if (!src_url_equal(img.src, img_src_value = "https://cdn.jsdelivr.net/gh/BasePowerCompany/preorder-booking@1.0.1/public/Base_files/map-pin.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Map pin icon");
    			add_location(img, file$1, 91, 4, 3338);
    			attr_dev(div0, "class", "input-address-container");
    			add_location(div0, file$1, 90, 2, 3296);
    			attr_dev(button, "class", "submitAddressButton button secondary w-button");
    			add_location(button, file$1, 117, 2, 4167);
    			attr_dev(div1, "class", "input-address-wrap");
    			add_location(div1, file$1, 89, 0, 3261);
    			attr_dev(div2, "class", "focus_overlay");
    			add_location(div2, file$1, 126, 0, 4410);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, img);
    			append_dev(div0, t0);
    			mount_component(googleplaceautocomplete, div0, null);
    			append_dev(div1, t1);
    			append_dev(div1, button);
    			append_dev(button, t2);
    			append_dev(div1, t3);
    			if (if_block) if_block.m(div1, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div2, anchor);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleSubmit*/ ctx[5], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			const googleplaceautocomplete_changes = {};
    			if (dirty & /*googlePublicApiKey*/ 1) googleplaceautocomplete_changes.apiKey = /*googlePublicApiKey*/ ctx[0];
    			if (dirty & /*onAddressSelect, inputErrorMessage, selectedAddress*/ 28) googleplaceautocomplete_changes.onSelect = /*func*/ ctx[8];
    			googleplaceautocomplete.$set(googleplaceautocomplete_changes);
    			if (!current || dirty & /*addressCtaText*/ 2) set_data_dev(t2, /*addressCtaText*/ ctx[1]);

    			if (/*inputErrorMessage*/ ctx[4]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					if_block.m(div1, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(googleplaceautocomplete.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(googleplaceautocomplete.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_component(googleplaceautocomplete);
    			if (if_block) if_block.d();
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div2);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let inputErrorMessage;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('LocationInput', slots, []);
    	let { targetDisplayAddress } = $$props;
    	let { googlePublicApiKey } = $$props;
    	let { addressCtaText = "See if my home qualifies" } = $$props;
    	let { onAddressSelect } = $$props;
    	let { onAddressSubmitSuccess } = $$props;
    	const dispatch = createEventDispatcher();
    	let addressInput;
    	let autocomplete;
    	let isFocused = false;
    	let isOverlayVisible = false;
    	let isInputFocused = false;
    	let isInputValid = false;
    	let isSubmitting = false;
    	let errorMessage = "";
    	let selectedAddress = null;

    	function handleInputFocus() {
    		isInputFocused = true;
    		isOverlayVisible = true;
    	}

    	function handleInputBlur() {
    		isInputFocused = false;

    		setTimeout(
    			() => {
    				isOverlayVisible = false;
    			},
    			200
    		);
    	}

    	function handleInputChange() {
    		const value = addressInput.value.trim();
    		isInputValid = value.length > 0;
    		errorMessage = "";
    	}

    	function handleSubmit() {
    		console.log("handleSubmit called with address:", selectedAddress);

    		if (!selectedAddress) {
    			errorMessage = "Please enter a full address.";
    			return;
    		}

    		if (!selectedAddress.postalCode || !selectedAddress.houseNumber || !selectedAddress.street) {
    			errorMessage = "Please enter a full address.";
    			console.log("Validation failed - missing required fields:", selectedAddress);
    			return;
    		}

    		const targetDisplayAddressEl = document.querySelector(targetDisplayAddress);

    		if (targetDisplayAddressEl) {
    			targetDisplayAddressEl.innerHTML = selectedAddress.formattedAddress;
    		}

    		addressState.update({ selectedAddress });
    		console.log("Calling onAddressSubmitSuccess with:", selectedAddress);

    		onAddressSubmitSuccess === null || onAddressSubmitSuccess === void 0
    		? void 0
    		: onAddressSubmitSuccess(selectedAddress);
    	}

    	function handlePlaceSelect() {
    		const place = autocomplete.getPlace();

    		if (place) {
    			$$invalidate(3, selectedAddress = parsePlaceResult(place));
    			onAddressSelect(selectedAddress);
    			isInputValid = true;
    			errorMessage = "";
    		}
    	}

    	onMount(() => {
    		jQuery(".input-address-container").on("click", function () {
    			jQuery(".focus_overlay").show();
    			jQuery(".input-address-container").addClass("focused");
    			jQuery("input.location-search-input").attr("placeholder", "Enter home address");
    			jQuery("button.submitAddressButton").hide();
    		});

    		jQuery(".input-address-container").on("keydown", function () {
    			jQuery("input.location-search-input").attr("placeholder", "");
    		});

    		jQuery(".focus_overlay").on("click", function () {
    			jQuery(".focus_overlay").hide();
    			jQuery(".submitAddressButton").show();
    			jQuery(".input-address-container").removeClass("focused");
    		});
    	});

    	$$self.$$.on_mount.push(function () {
    		if (targetDisplayAddress === undefined && !('targetDisplayAddress' in $$props || $$self.$$.bound[$$self.$$.props['targetDisplayAddress']])) {
    			console_1.warn("<LocationInput> was created without expected prop 'targetDisplayAddress'");
    		}

    		if (googlePublicApiKey === undefined && !('googlePublicApiKey' in $$props || $$self.$$.bound[$$self.$$.props['googlePublicApiKey']])) {
    			console_1.warn("<LocationInput> was created without expected prop 'googlePublicApiKey'");
    		}

    		if (onAddressSelect === undefined && !('onAddressSelect' in $$props || $$self.$$.bound[$$self.$$.props['onAddressSelect']])) {
    			console_1.warn("<LocationInput> was created without expected prop 'onAddressSelect'");
    		}

    		if (onAddressSubmitSuccess === undefined && !('onAddressSubmitSuccess' in $$props || $$self.$$.bound[$$self.$$.props['onAddressSubmitSuccess']])) {
    			console_1.warn("<LocationInput> was created without expected prop 'onAddressSubmitSuccess'");
    		}
    	});

    	const writable_props = [
    		'targetDisplayAddress',
    		'googlePublicApiKey',
    		'addressCtaText',
    		'onAddressSelect',
    		'onAddressSubmitSuccess'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<LocationInput> was created with unknown prop '${key}'`);
    	});

    	const func = value => {
    		console.log("Place selected:", value);
    		const parsed = parsePlaceResult(value);
    		console.log("Parsed place result:", parsed);
    		onAddressSelect?.(parsed);
    		window.blur();
    		$$invalidate(4, inputErrorMessage = "");
    		$$invalidate(3, selectedAddress = parsed);
    		handleSubmit();
    	};

    	$$self.$$set = $$props => {
    		if ('targetDisplayAddress' in $$props) $$invalidate(6, targetDisplayAddress = $$props.targetDisplayAddress);
    		if ('googlePublicApiKey' in $$props) $$invalidate(0, googlePublicApiKey = $$props.googlePublicApiKey);
    		if ('addressCtaText' in $$props) $$invalidate(1, addressCtaText = $$props.addressCtaText);
    		if ('onAddressSelect' in $$props) $$invalidate(2, onAddressSelect = $$props.onAddressSelect);
    		if ('onAddressSubmitSuccess' in $$props) $$invalidate(7, onAddressSubmitSuccess = $$props.onAddressSubmitSuccess);
    	};

    	$$self.$capture_state = () => ({
    		GooglePlaceAutocomplete,
    		parsePlaceResult,
    		displayBlock,
    		displayNone,
    		fadeIn,
    		onMount,
    		addressState,
    		createEventDispatcher,
    		fade,
    		fadeOut,
    		windowVars,
    		targetDisplayAddress,
    		googlePublicApiKey,
    		addressCtaText,
    		onAddressSelect,
    		onAddressSubmitSuccess,
    		dispatch,
    		addressInput,
    		autocomplete,
    		isFocused,
    		isOverlayVisible,
    		isInputFocused,
    		isInputValid,
    		isSubmitting,
    		errorMessage,
    		selectedAddress,
    		handleInputFocus,
    		handleInputBlur,
    		handleInputChange,
    		handleSubmit,
    		handlePlaceSelect,
    		inputErrorMessage
    	});

    	$$self.$inject_state = $$props => {
    		if ('targetDisplayAddress' in $$props) $$invalidate(6, targetDisplayAddress = $$props.targetDisplayAddress);
    		if ('googlePublicApiKey' in $$props) $$invalidate(0, googlePublicApiKey = $$props.googlePublicApiKey);
    		if ('addressCtaText' in $$props) $$invalidate(1, addressCtaText = $$props.addressCtaText);
    		if ('onAddressSelect' in $$props) $$invalidate(2, onAddressSelect = $$props.onAddressSelect);
    		if ('onAddressSubmitSuccess' in $$props) $$invalidate(7, onAddressSubmitSuccess = $$props.onAddressSubmitSuccess);
    		if ('addressInput' in $$props) addressInput = $$props.addressInput;
    		if ('autocomplete' in $$props) autocomplete = $$props.autocomplete;
    		if ('isFocused' in $$props) isFocused = $$props.isFocused;
    		if ('isOverlayVisible' in $$props) isOverlayVisible = $$props.isOverlayVisible;
    		if ('isInputFocused' in $$props) isInputFocused = $$props.isInputFocused;
    		if ('isInputValid' in $$props) isInputValid = $$props.isInputValid;
    		if ('isSubmitting' in $$props) isSubmitting = $$props.isSubmitting;
    		if ('errorMessage' in $$props) errorMessage = $$props.errorMessage;
    		if ('selectedAddress' in $$props) $$invalidate(3, selectedAddress = $$props.selectedAddress);
    		if ('inputErrorMessage' in $$props) $$invalidate(4, inputErrorMessage = $$props.inputErrorMessage);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(4, inputErrorMessage = "");
    	$$invalidate(3, selectedAddress = null);

    	return [
    		googlePublicApiKey,
    		addressCtaText,
    		onAddressSelect,
    		selectedAddress,
    		inputErrorMessage,
    		handleSubmit,
    		targetDisplayAddress,
    		onAddressSubmitSuccess,
    		func
    	];
    }

    class LocationInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			targetDisplayAddress: 6,
    			googlePublicApiKey: 0,
    			addressCtaText: 1,
    			onAddressSelect: 2,
    			onAddressSubmitSuccess: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LocationInput",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get targetDisplayAddress() {
    		throw new Error("<LocationInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set targetDisplayAddress(value) {
    		throw new Error("<LocationInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get googlePublicApiKey() {
    		throw new Error("<LocationInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set googlePublicApiKey(value) {
    		throw new Error("<LocationInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get addressCtaText() {
    		throw new Error("<LocationInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addressCtaText(value) {
    		throw new Error("<LocationInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onAddressSelect() {
    		throw new Error("<LocationInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onAddressSelect(value) {
    		throw new Error("<LocationInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onAddressSubmitSuccess() {
    		throw new Error("<LocationInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onAddressSubmitSuccess(value) {
    		throw new Error("<LocationInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/location-input/ZipCodeInput.svelte generated by Svelte v3.59.2 */
    const file = "src/location-input/ZipCodeInput.svelte";

    function create_fragment(ctx) {
    	let div8;
    	let div7;
    	let div6;
    	let input_1;
    	let t0;
    	let div5;
    	let div0;
    	let t1_value = (/*zipCode*/ ctx[1][0] || '') + "";
    	let t1;
    	let t2;
    	let div1;
    	let t3_value = (/*zipCode*/ ctx[1][1] || '') + "";
    	let t3;
    	let t4;
    	let div2;
    	let t5_value = (/*zipCode*/ ctx[1][2] || '') + "";
    	let t5;
    	let t6;
    	let div3;
    	let t7_value = (/*zipCode*/ ctx[1][3] || '') + "";
    	let t7;
    	let t8;
    	let div4;
    	let t9_value = (/*zipCode*/ ctx[1][4] || '') + "";
    	let t9;
    	let t10;
    	let button;

    	let t11_value = (/*isComplete*/ ctx[5]
    	? /*addressCtaText*/ ctx[0]
    	: "Enter your zip code") + "";

    	let t11;
    	let button_disabled_value;
    	let t12;
    	let div9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			input_1 = element("input");
    			t0 = space();
    			div5 = element("div");
    			div0 = element("div");
    			t1 = text(t1_value);
    			t2 = space();
    			div1 = element("div");
    			t3 = text(t3_value);
    			t4 = space();
    			div2 = element("div");
    			t5 = text(t5_value);
    			t6 = space();
    			div3 = element("div");
    			t7 = text(t7_value);
    			t8 = space();
    			div4 = element("div");
    			t9 = text(t9_value);
    			t10 = space();
    			button = element("button");
    			t11 = text(t11_value);
    			t12 = space();
    			div9 = element("div");
    			attr_dev(input_1, "type", "text");
    			attr_dev(input_1, "inputmode", "numeric");
    			attr_dev(input_1, "pattern", "[0-9]*");
    			attr_dev(input_1, "class", "zip-search-input");
    			attr_dev(input_1, "maxlength", "5");
    			add_location(input_1, file, 84, 6, 2657);
    			attr_dev(div0, "class", "zip-box");
    			toggle_class(div0, "filled", /*zipCode*/ ctx[1].length >= 1);
    			add_location(div0, file, 95, 8, 2974);
    			attr_dev(div1, "class", "zip-box");
    			toggle_class(div1, "filled", /*zipCode*/ ctx[1].length >= 2);
    			add_location(div1, file, 96, 8, 3063);
    			attr_dev(div2, "class", "zip-box");
    			toggle_class(div2, "filled", /*zipCode*/ ctx[1].length >= 3);
    			add_location(div2, file, 97, 8, 3152);
    			attr_dev(div3, "class", "zip-box");
    			toggle_class(div3, "filled", /*zipCode*/ ctx[1].length >= 4);
    			add_location(div3, file, 98, 8, 3241);
    			attr_dev(div4, "class", "zip-box");
    			toggle_class(div4, "filled", /*zipCode*/ ctx[1].length >= 5);
    			add_location(div4, file, 99, 8, 3330);
    			attr_dev(div5, "class", "zip-boxes");
    			add_location(div5, file, 94, 6, 2942);
    			attr_dev(div6, "class", "zip-input-layout");
    			add_location(div6, file, 83, 4, 2620);
    			attr_dev(button, "class", "submitZipButton button secondary w-button");
    			button.disabled = button_disabled_value = !/*isComplete*/ ctx[5];
    			add_location(button, file, 102, 4, 3439);
    			attr_dev(div7, "class", "input-zip-container");
    			add_location(div7, file, 82, 2, 2555);
    			attr_dev(div8, "class", "input-zip-wrap");
    			add_location(div8, file, 81, 0, 2524);
    			attr_dev(div9, "class", "focus_overlay");
    			add_location(div9, file, 111, 0, 3660);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, input_1);
    			/*input_1_binding*/ ctx[9](input_1);
    			append_dev(div6, t0);
    			append_dev(div6, div5);
    			append_dev(div5, div0);
    			append_dev(div0, t1);
    			append_dev(div5, t2);
    			append_dev(div5, div1);
    			append_dev(div1, t3);
    			append_dev(div5, t4);
    			append_dev(div5, div2);
    			append_dev(div2, t5);
    			append_dev(div5, t6);
    			append_dev(div5, div3);
    			append_dev(div3, t7);
    			append_dev(div5, t8);
    			append_dev(div5, div4);
    			append_dev(div4, t9);
    			append_dev(div7, t10);
    			append_dev(div7, button);
    			append_dev(button, t11);
    			/*div7_binding*/ ctx[11](div7);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div9, anchor);
    			/*div9_binding*/ ctx[12](div9);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input_1, "input", /*handleInput*/ ctx[6], false, false, false, false),
    					listen_dev(input_1, "keydown", /*keydown_handler*/ ctx[10], false, false, false, false),
    					listen_dev(button, "click", /*handleSubmit*/ ctx[7], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*zipCode*/ 2 && t1_value !== (t1_value = (/*zipCode*/ ctx[1][0] || '') + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*zipCode*/ 2) {
    				toggle_class(div0, "filled", /*zipCode*/ ctx[1].length >= 1);
    			}

    			if (dirty & /*zipCode*/ 2 && t3_value !== (t3_value = (/*zipCode*/ ctx[1][1] || '') + "")) set_data_dev(t3, t3_value);

    			if (dirty & /*zipCode*/ 2) {
    				toggle_class(div1, "filled", /*zipCode*/ ctx[1].length >= 2);
    			}

    			if (dirty & /*zipCode*/ 2 && t5_value !== (t5_value = (/*zipCode*/ ctx[1][2] || '') + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*zipCode*/ 2) {
    				toggle_class(div2, "filled", /*zipCode*/ ctx[1].length >= 3);
    			}

    			if (dirty & /*zipCode*/ 2 && t7_value !== (t7_value = (/*zipCode*/ ctx[1][3] || '') + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*zipCode*/ 2) {
    				toggle_class(div3, "filled", /*zipCode*/ ctx[1].length >= 4);
    			}

    			if (dirty & /*zipCode*/ 2 && t9_value !== (t9_value = (/*zipCode*/ ctx[1][4] || '') + "")) set_data_dev(t9, t9_value);

    			if (dirty & /*zipCode*/ 2) {
    				toggle_class(div4, "filled", /*zipCode*/ ctx[1].length >= 5);
    			}

    			if (dirty & /*isComplete, addressCtaText*/ 33 && t11_value !== (t11_value = (/*isComplete*/ ctx[5]
    			? /*addressCtaText*/ ctx[0]
    			: "Enter your zip code") + "")) set_data_dev(t11, t11_value);

    			if (dirty & /*isComplete*/ 32 && button_disabled_value !== (button_disabled_value = !/*isComplete*/ ctx[5])) {
    				prop_dev(button, "disabled", button_disabled_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div8);
    			/*input_1_binding*/ ctx[9](null);
    			/*div7_binding*/ ctx[11](null);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div9);
    			/*div9_binding*/ ctx[12](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let inputErrorMessage;
    	let isComplete;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ZipCodeInput', slots, []);
    	let { addressCtaText = "See if I qualify" } = $$props;

    	let { onAddressSubmitSuccess = () => {
    		
    	} } = $$props;

    	let inputContainer;
    	let focusOverlay;
    	let input;

    	const handleContainerClick = () => {
    		if (zipCode.length !== 5) {
    			// Only show overlay if not complete
    			$$invalidate(3, focusOverlay.style.display = "block", focusOverlay);

    			inputContainer.classList.add("focused");
    		}

    		input === null || input === void 0
    		? void 0
    		: input.focus();
    	};

    	const handleOverlayClick = () => {
    		$$invalidate(3, focusOverlay.style.display = "none", focusOverlay);
    		inputContainer.classList.remove("focused");
    	};

    	onMount(() => {
    		if (inputContainer && focusOverlay) {
    			inputContainer.addEventListener("click", handleContainerClick);
    			focusOverlay.addEventListener("click", handleOverlayClick);
    		}
    	});

    	onDestroy(() => {
    		if (inputContainer && focusOverlay) {
    			inputContainer.removeEventListener("click", handleContainerClick);
    			focusOverlay.removeEventListener("click", handleOverlayClick);
    		}
    	});

    	let zipCode = "";

    	const handleInput = event => {
    		const input = event.target;

    		// Only allow numbers
    		const value = input.value.replace(/\D/g, '');

    		// Limit to 5 digits
    		if (value.length > 5) {
    			input.value = value.slice(0, 5);
    		} else {
    			input.value = value;
    		}

    		$$invalidate(1, zipCode = input.value);
    	};

    	const handleSubmit = () => {
    		if (!zipCode) {
    			inputErrorMessage = "Please enter a zip code.";
    			return;
    		}

    		if (zipCode.length !== 5) {
    			inputErrorMessage = "Please enter a valid 5-digit zip code.";
    			return;
    		}

    		// Create a minimal address object for consistency with LocationInput
    		const minimalAddress = {
    			title: "",
    			formattedAddress: zipCode,
    			externalId: "",
    			externalUrl: "",
    			houseNumber: "",
    			street: "",
    			street_2: "",
    			city: "",
    			county: "",
    			stateShort: "",
    			stateLong: "",
    			countryCode: "US",
    			countryLong: "United States",
    			postalCode: zipCode
    		};

    		// Always update state and call success handler
    		addressState.update({ selectedAddress: minimalAddress });

    		onAddressSubmitSuccess === null || onAddressSubmitSuccess === void 0
    		? void 0
    		: onAddressSubmitSuccess(minimalAddress);
    	};

    	const writable_props = ['addressCtaText', 'onAddressSubmitSuccess'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ZipCodeInput> was created with unknown prop '${key}'`);
    	});

    	function input_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			input = $$value;
    			$$invalidate(4, input);
    		});
    	}

    	const keydown_handler = e => e.key === 'Enter' && isComplete && handleSubmit();

    	function div7_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			inputContainer = $$value;
    			$$invalidate(2, inputContainer);
    		});
    	}

    	function div9_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			focusOverlay = $$value;
    			$$invalidate(3, focusOverlay);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ('addressCtaText' in $$props) $$invalidate(0, addressCtaText = $$props.addressCtaText);
    		if ('onAddressSubmitSuccess' in $$props) $$invalidate(8, onAddressSubmitSuccess = $$props.onAddressSubmitSuccess);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		onDestroy,
    		displayBlock,
    		displayNone,
    		fadeIn,
    		addressState,
    		addressCtaText,
    		onAddressSubmitSuccess,
    		inputContainer,
    		focusOverlay,
    		input,
    		handleContainerClick,
    		handleOverlayClick,
    		zipCode,
    		handleInput,
    		handleSubmit,
    		inputErrorMessage,
    		isComplete
    	});

    	$$self.$inject_state = $$props => {
    		if ('addressCtaText' in $$props) $$invalidate(0, addressCtaText = $$props.addressCtaText);
    		if ('onAddressSubmitSuccess' in $$props) $$invalidate(8, onAddressSubmitSuccess = $$props.onAddressSubmitSuccess);
    		if ('inputContainer' in $$props) $$invalidate(2, inputContainer = $$props.inputContainer);
    		if ('focusOverlay' in $$props) $$invalidate(3, focusOverlay = $$props.focusOverlay);
    		if ('input' in $$props) $$invalidate(4, input = $$props.input);
    		if ('zipCode' in $$props) $$invalidate(1, zipCode = $$props.zipCode);
    		if ('inputErrorMessage' in $$props) inputErrorMessage = $$props.inputErrorMessage;
    		if ('isComplete' in $$props) $$invalidate(5, isComplete = $$props.isComplete);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*zipCode*/ 2) {
    			$$invalidate(5, isComplete = zipCode.length === 5);
    		}
    	};

    	inputErrorMessage = "";

    	return [
    		addressCtaText,
    		zipCode,
    		inputContainer,
    		focusOverlay,
    		input,
    		isComplete,
    		handleInput,
    		handleSubmit,
    		onAddressSubmitSuccess,
    		input_1_binding,
    		keydown_handler,
    		div7_binding,
    		div9_binding
    	];
    }

    class ZipCodeInput extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			addressCtaText: 0,
    			onAddressSubmitSuccess: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ZipCodeInput",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get addressCtaText() {
    		throw new Error("<ZipCodeInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set addressCtaText(value) {
    		throw new Error("<ZipCodeInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onAddressSubmitSuccess() {
    		throw new Error("<ZipCodeInput>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onAddressSubmitSuccess(value) {
    		throw new Error("<ZipCodeInput>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // Track initialization state
    let isZipCodeInitialized = false;
    const PreorderApp = {
        initialize: (props) => {
            const { targetElAddressInput = document.getElementById("hero-address-entry"), googlePublicApiKey, onAddressSelect, onAddressSubmitSuccess, addressCtaText, querySelectorClickToOpenForm, } = props;
            const locationInput = new LocationInput({
                target: targetElAddressInput,
                props: {
                    googlePublicApiKey,
                    onAddressSelect,
                    onAddressSubmitSuccess,
                    addressCtaText: "See if my home qualifies",
                    targetDisplayAddress: "#hero-address-entry",
                },
            });
            // Add click-to-open logic if selector is provided
            if (querySelectorClickToOpenForm && targetElAddressInput) {
                const triggerEls = document.querySelectorAll(querySelectorClickToOpenForm);
                triggerEls.forEach((el) => {
                    el.addEventListener("click", () => {
                        // Scroll to the form
                        targetElAddressInput.scrollIntoView({
                            behavior: "smooth",
                            block: "center",
                        });
                        // Simulate a click on the input-address-container to trigger overlay/focus
                        const container = targetElAddressInput.querySelector(".input-address-container");
                        if (container) {
                            container.dispatchEvent(new MouseEvent("click", { bubbles: true }));
                        }
                        // Optionally, focus the input as well
                        const input = targetElAddressInput.querySelector("input");
                        if (input) {
                            input.focus();
                        }
                    });
                });
            }
            return locationInput;
        },
        initializeZipCode: (props) => {
            // Prevent multiple initializations
            if (isZipCodeInitialized) {
                console.warn('ZipCodeInput already initialized, skipping...');
                return;
            }
            const { targetElAddressInput = document.getElementById("zip-code-entry"), onAddressSubmitSuccess, addressCtaText, querySelectorClickToOpenForm, } = props;
            const zipCodeInput = new ZipCodeInput({
                target: targetElAddressInput,
                props: {
                    onAddressSubmitSuccess,
                    addressCtaText,
                },
            });
            // Add click-to-open logic if selector is provided
            if (querySelectorClickToOpenForm && targetElAddressInput) {
                const triggerEls = document.querySelectorAll(querySelectorClickToOpenForm);
                triggerEls.forEach((el) => {
                    el.addEventListener("click", () => {
                        // Find the input inside the target element and focus it
                        const input = targetElAddressInput.querySelector("input");
                        if (input) {
                            input.focus();
                            // Optionally, add a 'focused' class to the container
                            const container = targetElAddressInput.querySelector(".input-zip-container");
                            if (container) {
                                container.classList.add("focused");
                            }
                        }
                    });
                });
            }
            // Mark as initialized
            isZipCodeInitialized = true;
            return zipCodeInput;
        },
    };

    window.BasePreorderApp = PreorderApp;
    // Initialize ZIP code input when DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
        // Initialize ZIP code input if it exists
        if (document.getElementById("zip-code-entry")) {
            PreorderApp.initializeZipCode({
                targetElAddressInput: document.getElementById("zip-code-entry"),
                querySelectorClickToOpenForm: '[data-preorder="open"]',
                addressCtaText: "Check availability",
                googleSheetConfig: {
                    zipsCsvUrl: "https://bpc-web-static-files.s3.us-east-2.amazonaws.com/deregulated-zips.csv",
                },
                onAddressSubmitSuccess: async (addressData, leadType, zipConfig) => {
                    const marketStatus = (zipConfig === null || zipConfig === void 0 ? void 0 : zipConfig.servingNow) || "no";
                    const redirectPath = marketStatus === "yes"
                        ? "/available-now"
                        : marketStatus === "preorder"
                            ? "/available-soon"
                            : "/not-available";
                    const url = new URL(redirectPath, window.location.origin);
                    const currentParams = new URLSearchParams(window.location.search);
                    const selectedParams = {
                        zip: (addressData === null || addressData === void 0 ? void 0 : addressData.postalCode) || "",
                        gclid: currentParams.get("gclid"),
                        utm_source: currentParams.get("utm_source"),
                        utm_medium: currentParams.get("utm_medium"),
                        utm_campaign: currentParams.get("utm_campaign"),
                        utm_term: currentParams.get("utm_term"),
                        utm_content: currentParams.get("utm_content"),
                        referrer_name: currentParams.get("referrer_name"),
                    };
                    const filteredParams = {};
                    Object.entries(selectedParams).forEach(([k, v]) => {
                        if (v) {
                            filteredParams[k] = v;
                        }
                    });
                    url.search = new URLSearchParams(filteredParams).toString();
                    window.location.href = url.toString();
                },
            });
        }
    });

}));
//# sourceMappingURL=embed.js.map
