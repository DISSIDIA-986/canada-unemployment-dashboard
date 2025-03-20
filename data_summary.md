# JSON Data Summary

This document provides a summary of the JSON data files used by the Alberta Dashboard application.
Each section shows the filename and the first element of the data array to provide insight into the data structure.

## age.json

Array with 2360 elements. First element sample:

```json
{
  "Date": "1976-01-01T00:00:00",
  "GeoID": 48,
  "GeoName": "Alberta",
  "Characteristic": "Unemployment",
  "Sex": "Both sexes",
  "Age": "15 years and over",
  "Value": 37000
}
```

**Available fields:** `Age`, `Characteristic`, `Date`, `GeoID`, `GeoName`, `Sex`, `Value`

## alberta.json

Array with 7080 elements. First element sample:

```json
{
  "Date": "1976-01-01T00:00:00",
  "GeoID": 48,
  "GeoName": "Alberta",
  "Characteristic": "Unemployment",
  "Sex": "Male",
  "Age": "15 years and over",
  "Value": 20000
}
```

**Available fields:** `Age`, `Characteristic`, `Date`, `GeoID`, `GeoName`, `Sex`, `Value`

## city.json

Array with 680 elements. First element sample:

```json
{
  "Date": "2011-01-01T00:00:00",
  "GeoID": "48",
  "GeoName": "Alberta",
  "Characteristics": "Unemployment rate",
  "Value": 6.0
}
```

**Available fields:** `Characteristics`, `Date`, `GeoID`, `GeoName`, `Value`

## education.json

Array with 3798 elements. First element sample:

```json
{
  "Date": "1990-01-01T00:00:00",
  "GeoID": "48",
  "GeoName": "Alberta",
  "Characteristics": "Unemployment rate",
  "Education": "High school graduate",
  "Sex": "Both sexes",
  "Age": "15 years and over",
  "Value": 8.0
}
```

**Available fields:** `Age`, `Characteristics`, `Date`, `Education`, `GeoID`, `GeoName`, `Sex`, `Value`

## industry.json

Array with 12056 elements. First element sample:

```json
{
  "Date": "1976-01-01T00:00:00",
  "GeoID": "48",
  "GeoName": "Alberta",
  "NAICS": "55, 56",
  "NAICS Description": "Business, building and other support services",
  "Characteristic": "Unemployment",
  "Sex": "Both sexes",
  "Age": "15 years and over",
  "Value": 1800.0
}
```

**Available fields:** `Age`, `Characteristic`, `Date`, `GeoID`, `GeoName`, `NAICS`, `NAICS Description`, `Sex`, `Value`

## occupation.json

Array with 27480 elements. First element sample:

```json
{
  "Date": "1987-01-01T00:00:00",
  "GeoID": 48,
  "GeoName": "Alberta",
  "Characteristics": "Unemployment rate",
  "NOC": "51-55",
  "NOC Description": "Occupations in art, culture, recreation and sport, except management",
  "Sex": "Both sexes",
  "Value": null
}
```

**Available fields:** `Characteristics`, `Date`, `GeoID`, `GeoName`, `NOC`, `NOC Description`, `Sex`, `Value`

## province.json

Array with 6490 elements. First element sample:

```json
{
  "Date": "1976-01-01T00:00:00",
  "GeoID": "59",
  "GeoName": "British Columbia",
  "Characteristic": "Unemployment rate",
  "Sex": "Both sexes",
  "Age": "15 years and over",
  "Value": 8.5
}
```

**Available fields:** `Age`, `Characteristic`, `Date`, `GeoID`, `GeoName`, `Sex`, `Value`

## region.json

Array with 14238 elements. First element sample:

```json
{
  "Date": "2006-03-01T00:00:00",
  "GeoID": 5980,
  "GeoName": "Northeast",
  "Characteristics": "Unemployment rate",
  "Value": null
}
```

**Available fields:** `Characteristics`, `Date`, `GeoID`, `GeoName`, `Value`

## sex.json

Array with 1180 elements. First element sample:

```json
{
  "Date": "1976-01-01",
  "Value": 5.2,
  "Series": "Female",
  "labels": "1976-01-01T00:00:00"
}
```

**Available fields:** `Date`, `Series`, `Value`, `labels`

