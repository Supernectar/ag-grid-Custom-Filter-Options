"use client";

import React, { useMemo, useRef, useState, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AgGridReact } from "@ag-grid-community/react";
import {
  INumberFilterParams,
  IFilterOptionDef,
  ColDef,
} from "@ag-grid-community/core";
import "./styles.css";
import { IRowData } from "./interfaces";
import "@ag-grid-community/styles/ag-grid.min.css";
import "@ag-grid-community/styles/ag-theme-quartz.min.css";

const defaultNumberFilterAllowedCharPattern = "\\d\\-\\,\\.";

export const amountNumberParser = (numberString) => {
  console.log(numberString);
  let filterVal = numberString == null ? null : numberString.replace(",", ".");

  return parseFloat(filterVal);
};

const amountValueFormatter = (params) => {
  return Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(params.value);
};

function getDecimalSeparator() {
  const numberFormat = new Intl.NumberFormat(navigator.language);
  const parts = numberFormat.formatToParts(1.1);
  const decimalPart = parts.find((part) => part.type === "decimal");
  return decimalPart ? decimalPart.value : ".";
}

const filterParams: INumberFilterParams = {
  filterOptions: [
    {
      displayKey: "contains",
      displayName: "Contains",
      predicate: ([fv1]: any[], cellValue) => {
        const formattedCellValue = Intl.NumberFormat(navigator.language, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(cellValue);
        const charsToRemove = [".", ","];
        const charToRemove = charsToRemove.find(
          (char) => char !== getDecimalSeparator()
        );

        const sanitizedCellValue = formattedCellValue
          .replace(new RegExp(`\\${charToRemove}`, "g"), "")
          .replace(new RegExp(`\\${getDecimalSeparator()}`, "g"), ".");
        console.log(String(sanitizedCellValue), "vs", String(fv1));

        return String(sanitizedCellValue).includes(String(fv1));
      },
      numberOfInputs: 1,
    },
    "equals",
    "notEqual",
    "greaterThan",
    "greaterThanOrEqual",
    "lessThan",
    "lessThanOrEqual",
    "inRange",
    "blank",
    "notBlank",
  ] as unknown as IFilterOptionDef[],
  maxNumConditions: 1,
  allowedCharPattern: defaultNumberFilterAllowedCharPattern,
  numberParser: amountNumberParser,
};

const GridExample = () => {
  const gridRef = useRef<AgGridReact<IRowData>>(null);
  const containerStyle = useMemo(() => ({ width: "100%", height: "100%" }), []);
  const gridStyle = useMemo(() => ({ height: "100%", width: "100%" }), []);
  const [columnDefs, setColumnDefs] = useState<ColDef[]>([
    {
      field: "name",
    },
    {
      field: "wholeNumberField",
      minWidth: 120,
      filter: "agNumberColumnFilter",
      filterParams: filterParams,
    },
    {
      field: "decimalNumberField",
      filter: "agNumberColumnFilter",
      filterParams: filterParams,
      valueFormatter: amountValueFormatter,
    },
  ]);
  const defaultColDef = useMemo<ColDef>(() => {
    return {
      flex: 1,
      minWidth: 150,
      filter: true,
      floatingFilter: true,
    };
  }, []);

  return (
    <div style={containerStyle}>
      <div className="example-wrapper">
        <div style={gridStyle} className="ag-theme-quartz">
          <AgGridReact<IRowData>
            ref={gridRef}
            rowData={[
              {
                name: "name1",
                wholeNumberField: 123,
                decimalNumberField: 1111.1,
              },
              {
                name: "name2",
                wholeNumberField: 123,
                decimalNumberField: 123456.45,
              },
              {
                name: "name3",
                wholeNumberField: 123456789,
                decimalNumberField: 654123.456789,
              },
              {
                name: "name4",
                wholeNumberField: 123456789,
                decimalNumberField: 123456789.456789,
              },
              {
                name: "name5",
                wholeNumberField: 999,
                decimalNumberField: 999.987,
              },
            ]}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
          />
        </div>
      </div>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(
  <StrictMode>
    <GridExample />
  </StrictMode>
);
