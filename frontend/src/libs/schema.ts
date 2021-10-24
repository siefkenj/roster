// a collection of key-mapping between imported JSON keys/ Spreadsheet Column names and
// actual keys of an object

export interface NormalizationSchema<T extends string[]> {
    keys: T;
    keyMap: Record<string, T[number]>;
    requiredKeys: T[number][];
    primaryKey: T[number] | T[number][];
    dateColumns: T[number][];
    baseName: string;
}

export const studentSchema: NormalizationSchema<
    [
        "first_name",
        "last_name",
        "utorid",
        "email",
        "student_number",
        "matching_data"
    ]
> = {
    keys: [
        "first_name",
        "last_name",
        "utorid",
        "email",
        "student_number",
        "matching_data",
    ],
    keyMap: {
        "First Name": "first_name",
        "Given Name": "first_name",
        First: "first_name",
        "Last Name": "last_name",
        Surname: "last_name",
        "Family Name": "last_name",
        Last: "last_name",
        "Student Number": "student_number",
        "ID Number": "student_number",
        "Student ID": "student_number",
        "Matching Data": "matching_data",
        "Extra Data": "matching_data",
        "Student Name": "first_name",
        Name: "first_name",
        "Full Name": "first_name",
    },
    requiredKeys: ["utorid"],
    primaryKey: "utorid",
    dateColumns: [],
    baseName: "students",
};

export const roomSchema: NormalizationSchema<["name"]> = {
    keys: ["name"],
    keyMap: {
        "Room Name": "name",
        "Building Name": "name",
        Room: "name",
    },
    requiredKeys: ["name"],
    primaryKey: "name",
    dateColumns: [],
    baseName: "rooms",
};
