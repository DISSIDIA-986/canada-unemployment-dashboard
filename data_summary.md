# JSON Data Summary

This document provides a summary of the JSON data files used by the Alberta Dashboard application.
Each section shows the filename and the first element of the data array to provide insight into the data structure.

## age.json

Array with 1740 elements. First element sample:

```json
{
  "Date": "2001-01-01T00:00:00",
  "GeoID": "01",
  "GeoName": "Canada",
  "Characteristic": "Unemployment rate",
  "Sex": "Female",
  "Age": "55 years and over",
  "Value": 5.4
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

Array with 10809 elements. First element sample:

```json
{
  "Date": "2006-03-01T00:00:00",
  "GeoID": "219",
  "GeoName": "Canada",
  "Characteristics": "Unemployment rate",
  "Value": 6.6
}
```

**Available fields:** `Characteristics`, `Date`, `GeoID`, `GeoName`, `Value`

## education.json

Array with 15660 elements. First element sample:

```json
{
  "Date": "2001-01-01T00:00:00",
  "GeoID": "01",
  "GeoName": "Canada",
  "Characteristics": "Unemployment rate",
  "Education": "Total, all education levels",
  "Sex": "Both sexes",
  "Age": "45 years and over",
  "Value": 5.9
}
```

**Available fields:** `Age`, `Characteristics`, `Date`, `Education`, `GeoID`, `GeoName`, `Sex`, `Value`

## industry.json

Array with 24360 elements. First element sample:

```json
{
  "Date": "2001-01-01T00:00:00",
  "GeoID": "2021A000011124",
  "GeoName": "Canada",
  "NAICS Description": "Total, all industries",
  "Characteristic": "Unemployment rate",
  "Sex": "Both sexes",
  "Age": "15 years and over",
  "Value": 12.6,
  "NAICS": ""
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

## salary.json

Array with 44376 elements. First element sample:

```json
{
  "NOC_CNP": "NOC_00010",
  "NOC_Title_eng": "Legislators",
  "NOC_Title_fra": "Membres des corps l\u00e9gislatifs",
  "prov": "NAT",
  "ER_Code_Code_RE": "ER00",
  "ER_Name": "Canada",
  "Nom_RE": "Canada",
  "Low_Wage_Salaire_Minium": 32360.0,
  "Median_Wage_Salaire_Median": 84000.0,
  "High_Wage_Salaire_Maximal": 184000.0,
  "Average_Wage_Salaire_Moyen": 97600.0,
  "Quartile1_Wage_Salaire_Quartile1": 54400.0,
  "Quartile3_Wage_Salaire_Quartile3": 132000.0,
  "Data_Source_E": "2021 Census",
  "Data_Source_F": "Recensement 2021",
  "Reference_Period": 2021,
  "Revision_Date_Date_revision": "2024-12-03",
  "Annual_Wage_Flag_Salaire_annuel": 1,
  "Wage_Comment_E": "Wages for this occupation are presented at an annual rate to better represent earnings for this occupation.",
  "Wage_Comment_F": "Pour cette profession sont pr\u00e9sent\u00e9s au taux annuel afin de mieux repr\u00e9senter la r\u00e9mun\u00e9ration pour cette profession.",
  "Non_WageBen_pct": 62.8
}
```

**Available fields:** `Annual_Wage_Flag_Salaire_annuel`, `Average_Wage_Salaire_Moyen`, `Data_Source_E`, `Data_Source_F`, `ER_Code_Code_RE`, `ER_Name`, `High_Wage_Salaire_Maximal`, `Low_Wage_Salaire_Minium`, `Median_Wage_Salaire_Median`, `NOC_CNP`, `NOC_Title_eng`, `NOC_Title_fra`, `Nom_RE`, `Non_WageBen_pct`, `Quartile1_Wage_Salaire_Quartile1`, `Quartile3_Wage_Salaire_Quartile3`, `Reference_Period`, `Revision_Date_Date_revision`, `Wage_Comment_E`, `Wage_Comment_F`, `prov`

## sex.json

Array with 1740 elements. First element sample:

```json
{
  "Date": "2001-01-01",
  "Value": 5.4,
  "Series": "Female",
  "labels": "2001-01-01T00:00:00"
}
```

**Available fields:** `Date`, `Series`, `Value`, `labels`

## vacancy_data.json

Data structure:

```json
{
  "metadata": {
    "source": "Statistics Canada - Labour Force Survey",
    "date_generated": "2025-03-27",
    "description": "Job vacancies, payroll employees, and job vacancy rate by industry sector"
  },
  "latest_data": {
    "date": "2024-12",
    "industries": [
      {
        "industry": "Health care and social assistance",
        "job_vacancies": 101530,
        "payroll_employees": 2427145,
        "job_vacancy_rate": 4
      }
    ],
    "vacancy_counts": [
      {
        "industry": "Health care and social assistance",
        "job_vacancies": 101530,
        "payroll_employees": 2427145,
        "job_vacancy_rate": 4
      }
    ]
  },
  "provincial_data": {
    "regions": [
      "Canada"
    ]
  },
  "industry_classifications": [
    {
      "name": "Agriculture, forestry, fishing and hunting",
      "code": "",
      "full_name": "Agriculture, forestry, fishing and hunting"
    }
  ]
}
```

**Available fields:** `industry_classifications`, `industry_data`, `latest_data`, `metadata`, `provincial_data`, `time_series`

