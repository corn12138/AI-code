/**
 * 数据处理工具集
 * 支持数据转换、查询、连接、透视等功能
 */

import { BaseTool, ToolDefinition, ToolExecutionContext, ToolExecutionResult } from '../ToolProtocol';

// 数据转换工具
export class DataTransformTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'data_transform',
            description: 'Transform data between different formats and structures',
            category: 'data',
            parameters: {
                data: {
                    name: 'data',
                    type: 'string',
                    description: 'Input data to transform',
                    required: true
                },
                fromFormat: {
                    name: 'fromFormat',
                    type: 'string',
                    description: 'Source data format',
                    required: true,
                    enum: ['json', 'csv', 'xml', 'yaml', 'array']
                },
                toFormat: {
                    name: 'toFormat',
                    type: 'string',
                    description: 'Target data format',
                    required: true,
                    enum: ['json', 'csv', 'xml', 'yaml', 'array']
                },
                options: {
                    name: 'options',
                    type: 'object',
                    description: 'Transformation options',
                    required: false,
                    properties: {}
                }
            },
            security: {
                level: 'safe',
                permissions: ['data:transform'],
                sandbox: true,
                timeout: 30000
            },
            examples: [
                {
                    description: 'Convert JSON to CSV',
                    input: { data: '[{"name":"John","age":30}]', fromFormat: 'json', toFormat: 'csv' },
                    output: { transformed: 'name,age\nJohn,30', format: 'csv' }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { data, fromFormat, toFormat, options = {} } = parameters;
        const startTime = Date.now();

        try {
            const transformed = this.transformData(data, fromFormat, toFormat, options);

            return {
                success: true,
                result: {
                    original: data,
                    transformed,
                    fromFormat,
                    toFormat,
                    size: transformed.length,
                    options
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DATA_TRANSFORM_ERROR',
                    message: error instanceof Error ? error.message : 'Data transformation failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private transformData(data: string, fromFormat: string, toFormat: string, options: any): string {
        // 先解析数据
        let parsedData = this.parseData(data, fromFormat);

        // 然后转换为目标格式
        return this.serializeData(parsedData, toFormat, options);
    }

    private parseData(data: string, format: string): any {
        switch (format) {
            case 'json':
                return JSON.parse(data);
            case 'csv':
                return this.parseCSV(data);
            case 'xml':
                return this.parseXML(data);
            case 'yaml':
                return this.parseYAML(data);
            case 'array':
                return Array.isArray(data) ? data : [data];
            default:
                throw new Error(`Unsupported source format: ${format}`);
        }
    }

    private serializeData(data: any, format: string, options: any): string {
        switch (format) {
            case 'json':
                return JSON.stringify(data, null, options.indent || 2);
            case 'csv':
                return this.toCSV(data, options);
            case 'xml':
                return this.toXML(data, options);
            case 'yaml':
                return this.toYAML(data, options);
            case 'array':
                return JSON.stringify(Array.isArray(data) ? data : [data]);
            default:
                throw new Error(`Unsupported target format: ${format}`);
        }
    }

    private parseCSV(csv: string): any[] {
        const lines = csv.trim().split('\n');
        const headers = lines[0].split(',');

        return lines.slice(1).map(line => {
            const values = line.split(',');
            const obj: any = {};
            headers.forEach((header, index) => {
                obj[header.trim()] = values[index]?.trim() || '';
            });
            return obj;
        });
    }

    private toCSV(data: any[], options: any = {}): string {
        if (!Array.isArray(data) || data.length === 0) {
            return '';
        }

        const headers = Object.keys(data[0]);
        const csvLines = [headers.join(',')];

        data.forEach(item => {
            const values = headers.map(header => item[header] || '');
            csvLines.push(values.join(','));
        });

        return csvLines.join('\n');
    }

    private parseXML(xml: string): any {
        // 简化的XML解析
        return { xml: 'XML parsing not fully implemented in this demo' };
    }

    private toXML(data: any, options: any = {}): string {
        // 简化的XML生成
        return `<data>${JSON.stringify(data)}</data>`;
    }

    private parseYAML(yaml: string): any {
        // 简化的YAML解析
        return { yaml: 'YAML parsing not fully implemented in this demo' };
    }

    private toYAML(data: any, options: any = {}): string {
        // 简化的YAML生成
        return JSON.stringify(data, null, 2).replace(/[{}]/g, '').replace(/"/g, '');
    }
}

// 数据查询工具
export class DataQueryTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'data_query',
            description: 'Query and filter data using SQL-like syntax',
            category: 'data',
            parameters: {
                data: {
                    name: 'data',
                    type: 'string',
                    description: 'Data to query (JSON format)',
                    required: true
                },
                query: {
                    name: 'query',
                    type: 'string',
                    description: 'Query expression (SQL-like)',
                    required: true
                }
            },
            security: {
                level: 'safe',
                permissions: ['data:query'],
                sandbox: true,
                timeout: 15000
            },
            examples: [
                {
                    description: 'Filter data by condition',
                    input: {
                        data: '[{"name":"John","age":30},{"name":"Jane","age":25}]',
                        query: 'SELECT * WHERE age > 25'
                    },
                    output: { results: [{ "name": "John", "age": 30 }] }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { data, query } = parameters;
        const startTime = Date.now();

        try {
            const parsedData = JSON.parse(data);
            const results = this.executeQuery(parsedData, query);

            return {
                success: true,
                result: {
                    query,
                    results,
                    count: Array.isArray(results) ? results.length : 1,
                    executionTime: Date.now() - startTime
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DATA_QUERY_ERROR',
                    message: error instanceof Error ? error.message : 'Data query failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private executeQuery(data: any[], query: string): any[] {
        const normalizedQuery = query.toLowerCase().trim();

        // 简化的SQL解析器
        if (normalizedQuery.startsWith('select')) {
            return this.handleSelect(data, normalizedQuery);
        }

        throw new Error('Only SELECT queries are supported');
    }

    private handleSelect(data: any[], query: string): any[] {
        let result = [...data];

        // 处理WHERE子句
        const whereMatch = query.match(/where\s+(.+?)(?:\s+order|\s+group|\s+limit|$)/);
        if (whereMatch) {
            const condition = whereMatch[1];
            result = this.applyFilter(result, condition);
        }

        // 处理ORDER BY
        const orderMatch = query.match(/order\s+by\s+(\w+)(?:\s+(asc|desc))?/);
        if (orderMatch) {
            const field = orderMatch[1];
            const direction = orderMatch[2] || 'asc';
            result = this.applySort(result, field, direction);
        }

        // 处理LIMIT
        const limitMatch = query.match(/limit\s+(\d+)/);
        if (limitMatch) {
            const limit = parseInt(limitMatch[1]);
            result = result.slice(0, limit);
        }

        return result;
    }

    private applyFilter(data: any[], condition: string): any[] {
        // 简化的条件解析
        return data.filter(item => {
            try {
                // 替换字段名为实际值
                let evaluableCondition = condition;
                Object.keys(item).forEach(key => {
                    const regex = new RegExp(`\\b${key}\\b`, 'g');
                    evaluableCondition = evaluableCondition.replace(regex, JSON.stringify(item[key]));
                });

                // 安全评估（仅允许简单比较）
                if (/^[0-9"'\s><!=]+$/.test(evaluableCondition)) {
                    return eval(evaluableCondition);
                }

                return false;
            } catch {
                return false;
            }
        });
    }

    private applySort(data: any[], field: string, direction: string): any[] {
        return data.sort((a, b) => {
            const aVal = a[field];
            const bVal = b[field];

            if (aVal < bVal) return direction === 'asc' ? -1 : 1;
            if (aVal > bVal) return direction === 'asc' ? 1 : -1;
            return 0;
        });
    }
}

// 数据连接工具
export class DataJoinTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'data_join',
            description: 'Join two datasets based on common fields',
            category: 'data',
            parameters: {
                leftData: {
                    name: 'leftData',
                    type: 'string',
                    description: 'Left dataset (JSON format)',
                    required: true
                },
                rightData: {
                    name: 'rightData',
                    type: 'string',
                    description: 'Right dataset (JSON format)',
                    required: true
                },
                joinKey: {
                    name: 'joinKey',
                    type: 'string',
                    description: 'Field to join on',
                    required: true
                },
                joinType: {
                    name: 'joinType',
                    type: 'string',
                    description: 'Type of join',
                    required: false,
                    enum: ['inner', 'left', 'right', 'outer'],
                    default: 'inner'
                }
            },
            security: {
                level: 'safe',
                permissions: ['data:join'],
                sandbox: true,
                timeout: 20000
            },
            examples: [
                {
                    description: 'Inner join two datasets',
                    input: {
                        leftData: '[{"id":1,"name":"John"}]',
                        rightData: '[{"id":1,"city":"NYC"}]',
                        joinKey: 'id'
                    },
                    output: { joined: [{ "id": 1, "name": "John", "city": "NYC" }] }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { leftData, rightData, joinKey, joinType = 'inner' } = parameters;
        const startTime = Date.now();

        try {
            const left = JSON.parse(leftData);
            const right = JSON.parse(rightData);
            const joined = this.performJoin(left, right, joinKey, joinType);

            return {
                success: true,
                result: {
                    joined,
                    joinType,
                    joinKey,
                    leftCount: left.length,
                    rightCount: right.length,
                    resultCount: joined.length
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DATA_JOIN_ERROR',
                    message: error instanceof Error ? error.message : 'Data join failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private performJoin(left: any[], right: any[], joinKey: string, joinType: string): any[] {
        const result: any[] = [];

        switch (joinType) {
            case 'inner':
                return this.innerJoin(left, right, joinKey);
            case 'left':
                return this.leftJoin(left, right, joinKey);
            case 'right':
                return this.rightJoin(left, right, joinKey);
            case 'outer':
                return this.outerJoin(left, right, joinKey);
            default:
                throw new Error(`Unsupported join type: ${joinType}`);
        }
    }

    private innerJoin(left: any[], right: any[], joinKey: string): any[] {
        const result: any[] = [];

        left.forEach(leftItem => {
            right.forEach(rightItem => {
                if (leftItem[joinKey] === rightItem[joinKey]) {
                    result.push({ ...leftItem, ...rightItem });
                }
            });
        });

        return result;
    }

    private leftJoin(left: any[], right: any[], joinKey: string): any[] {
        const result: any[] = [];

        left.forEach(leftItem => {
            const matches = right.filter(rightItem => rightItem[joinKey] === leftItem[joinKey]);

            if (matches.length > 0) {
                matches.forEach(match => {
                    result.push({ ...leftItem, ...match });
                });
            } else {
                result.push(leftItem);
            }
        });

        return result;
    }

    private rightJoin(left: any[], right: any[], joinKey: string): any[] {
        // Right join is like left join with swapped datasets
        return this.leftJoin(right, left, joinKey);
    }

    private outerJoin(left: any[], right: any[], joinKey: string): any[] {
        const leftJoined = this.leftJoin(left, right, joinKey);
        const rightJoined = this.leftJoin(right, left, joinKey);

        // Combine and deduplicate
        const combined = [...leftJoined, ...rightJoined];
        const seen = new Set();

        return combined.filter(item => {
            const key = JSON.stringify(item);
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }
}

// 数据透视工具
export class DataPivotTool extends BaseTool {
    constructor() {
        const definition: ToolDefinition = {
            name: 'data_pivot',
            description: 'Create pivot tables from data',
            category: 'data',
            parameters: {
                data: {
                    name: 'data',
                    type: 'string',
                    description: 'Data to pivot (JSON format)',
                    required: true
                },
                rowFields: {
                    name: 'rowFields',
                    type: 'array',
                    description: 'Fields to use as rows',
                    required: true,
                    items: {
                        name: 'field',
                        type: 'string',
                        description: 'Field name',
                        required: true
                    }
                },
                columnField: {
                    name: 'columnField',
                    type: 'string',
                    description: 'Field to use as columns',
                    required: true
                },
                valueField: {
                    name: 'valueField',
                    type: 'string',
                    description: 'Field to aggregate',
                    required: true
                },
                aggregation: {
                    name: 'aggregation',
                    type: 'string',
                    description: 'Aggregation function',
                    required: false,
                    enum: ['sum', 'count', 'avg', 'min', 'max'],
                    default: 'sum'
                }
            },
            security: {
                level: 'safe',
                permissions: ['data:pivot'],
                sandbox: true,
                timeout: 20000
            },
            examples: [
                {
                    description: 'Create sales pivot table',
                    input: {
                        data: '[{"region":"North","product":"A","sales":100}]',
                        rowFields: ['region'],
                        columnField: 'product',
                        valueField: 'sales'
                    },
                    output: { pivot: { "North": { "A": 100 } } }
                }
            ]
        };
        super(definition);
    }

    async execute(parameters: Record<string, any>, context: ToolExecutionContext): Promise<ToolExecutionResult> {
        const { data, rowFields, columnField, valueField, aggregation = 'sum' } = parameters;
        const startTime = Date.now();

        try {
            const parsedData = JSON.parse(data);
            const pivot = this.createPivotTable(parsedData, rowFields, columnField, valueField, aggregation);

            return {
                success: true,
                result: {
                    pivot,
                    configuration: {
                        rowFields,
                        columnField,
                        valueField,
                        aggregation
                    },
                    summary: this.generatePivotSummary(pivot)
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    code: 'DATA_PIVOT_ERROR',
                    message: error instanceof Error ? error.message : 'Data pivot failed'
                },
                metadata: { executionTime: Date.now() - startTime }
            };
        }
    }

    private createPivotTable(
        data: any[],
        rowFields: string[],
        columnField: string,
        valueField: string,
        aggregation: string
    ): any {
        const pivot: any = {};

        data.forEach(item => {
            // 构建行键
            const rowKey = rowFields.map(field => item[field]).join(' | ');
            const columnKey = item[columnField];
            const value = parseFloat(item[valueField]) || 0;

            if (!pivot[rowKey]) {
                pivot[rowKey] = {};
            }

            if (!pivot[rowKey][columnKey]) {
                pivot[rowKey][columnKey] = [];
            }

            pivot[rowKey][columnKey].push(value);
        });

        // 应用聚合函数
        Object.keys(pivot).forEach(rowKey => {
            Object.keys(pivot[rowKey]).forEach(columnKey => {
                const values = pivot[rowKey][columnKey];
                pivot[rowKey][columnKey] = this.aggregate(values, aggregation);
            });
        });

        return pivot;
    }

    private aggregate(values: number[], aggregation: string): number {
        switch (aggregation) {
            case 'sum':
                return values.reduce((a, b) => a + b, 0);
            case 'count':
                return values.length;
            case 'avg':
                return values.reduce((a, b) => a + b, 0) / values.length;
            case 'min':
                return Math.min(...values);
            case 'max':
                return Math.max(...values);
            default:
                return values.reduce((a, b) => a + b, 0);
        }
    }

    private generatePivotSummary(pivot: any): any {
        const rowCount = Object.keys(pivot).length;
        let columnCount = 0;
        let totalCells = 0;

        Object.values(pivot).forEach((row: any) => {
            const cols = Object.keys(row).length;
            columnCount = Math.max(columnCount, cols);
            totalCells += cols;
        });

        return {
            rowCount,
            maxColumnCount: columnCount,
            totalCells,
            density: rowCount > 0 ? totalCells / (rowCount * columnCount) : 0
        };
    }
}
