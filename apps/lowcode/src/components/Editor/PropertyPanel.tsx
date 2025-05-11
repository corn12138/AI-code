import React from 'react';

interface PropSchema {
  type: string;
  properties?: Record<string, PropSchema>;
  description?: string;
}

interface FormFieldProps {
  name: string;
  schema: PropSchema;
  value: any;
  onChange: (value: any) => void;
}

const FormField: React.FC<FormFieldProps> = ({ name, schema, value, onChange }) => {
  const { type } = schema;

  const renderField = () => {
    switch (type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full p-2 border border-gray-300 rounded"
          />
        );
      
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 text-primary-600 rounded border-gray-300"
          />
        );
      
      case 'array':
        // 简单数组编辑器
        return (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  const newArray = [...(value || []), ''];
                  onChange(newArray);
                }}
                className="p-1 text-xs bg-gray-100 hover:bg-gray-200 rounded"
              >
                添加项
              </button>
            </div>
            
            {(value || []).map((item: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newArray = [...(value || [])];
                    newArray[index] = e.target.value;
                    onChange(newArray);
                  }}
                  className="flex-1 p-2 border border-gray-300 rounded"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newArray = [...(value || [])];
                    newArray.splice(index, 1);
                    onChange(newArray);
                  }}
                  className="p-1 text-xs text-red-500 hover:bg-red-50 rounded"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        );
      
      case 'object':
        // 嵌套对象编辑器
        if (schema.properties) {
          return (
            <div className="space-y-2 border border-gray-200 rounded p-2">
              {Object.entries(schema.properties).map(([key, subSchema]) => (
                <FormField
                  key={key}
                  name={key}
                  schema={subSchema as PropSchema}
                  value={(value || {})[key]}
                  onChange={(subValue) => {
                    onChange({ ...(value || {}), [key]: subValue });
                  }}
                />
              ))}
            </div>
          );
        }
        return null;
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          />
        );
    }
  };
  
  return (
    <div className="mb-2">
      <label className="block text-sm font-medium text-gray-700 mb-1">{name}</label>
      {renderField()}
      {schema.description && (
        <p className="mt-1 text-xs text-gray-500">{schema.description}</p>
      )}
    </div>
  );
};

export default FormField;