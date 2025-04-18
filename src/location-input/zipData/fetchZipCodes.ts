import {
  storedZipDataItemKeys,
  StoredZipCSVColumnNames,
} from "./types";
import type {
  SheetDataConfig,
  StoredZipData,
  StoredZipDataItem,
  StoredZipDataItemKey,
  StoredZipCSVColumnName,
} from "./types";
// import { deregulatedZipData } from "./data";

export type SheetResult = {
  majorDimension: string;
  range: string;
  values: [string, string, string][];
};

const PAGE_SIZE = 500;

type Row = [string, string, string, string | null | undefined];
type FetchedData = Row[];

function validColumnNames(
  header: string[]
): header is StoredZipCSVColumnName[] {
  return StoredZipCSVColumnNames.reduce(
    (containsAll, currentKey) => containsAll && header.includes(currentKey),
    true
  );
}

function isValidStoredZipDataItem(item: object): item is StoredZipDataItem {
  const itemKeys = Object.keys(item);
  return (storedZipDataItemKeys as string[]).reduce(
    (valid, key) => valid && itemKeys.includes(key),
    true
  );
}

const colNameLookup: { [key in StoredZipCSVColumnName]: StoredZipDataItemKey } =
  {
    state_id: "stateShort",
    zip: "zip",
    Availability: "availability",
    serving_now: "servingNow",
  };

const unmarshal = (csv: string): StoredZipData => {
  const rows = csv.split("\n");
  if (rows.length < 1) {
    return;
  }
  const [header, ...rest] = rows;
  const columns = header.split(",");
  if (validColumnNames(columns)) {
    return rest.map((row: string) => {
      const currentRow: Partial<Record<StoredZipDataItemKey, string>> = {};
      const splitRow = row.split(",");
      columns.forEach((col, index) => {
        const zipDataItemKey = colNameLookup[col];
        if (zipDataItemKey !== undefined) {
          currentRow[zipDataItemKey] = `${splitRow[index]}`;
        }
      });
      if (isValidStoredZipDataItem(currentRow)) {
        return currentRow;
      } else {
        console.warn(`Found invalid deregulated row: ${currentRow}`);
      }
    }, []);
  } else {
    throw new Error(
      `Missing required deregulated zip column names: ${columns}`
    );
  }
};

export const fetchZipCodes = async (
  config: SheetDataConfig
): Promise<StoredZipData> => {
  const zipCSV = await fetch(config.zipsCsvUrl);
  const csvText = await (await zipCSV.blob()).text();
  return unmarshal(csvText);
};
