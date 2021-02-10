declare namespace Docupilot {
    interface Template{
        id: number;
        title: string;
        type: string;
        output_type: string;
    }
    interface TemplateList extends Array {
        [index: number]: Template;
        map<T>(arg0: (template: Template) => T): TemplateList;
    }
    interface SchemaField{
        name: string;
        type: string;
        fields?: Schema,
        generics?: string;
    }
    interface Schema extends Array {
        [index: number]: SchemaField;
        map<T>(arg0: (field: SchemaField) => T): Schema;
    }
    interface MappingValue {
        __airtable_field__?: string;
        __docupilot_type__: string;
        fields?: Mapping;
    }
    interface Mapping {
        [key: string]: MappingValue;
    }
}