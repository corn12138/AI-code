#!/usr/bin/env python3
"""
AI-Code 测试数据生成器
生成各种类型的测试数据，支持多种格式和场景
"""

import json
import random
from dataclasses import asdict, dataclass
from datetime import datetime
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

try:
    import yaml
    from faker import Faker
except ImportError:
    yaml = None
    Faker = None


class DataType(Enum):
    """数据类型"""

    USER = "user"
    ARTICLE = "article"
    COMMENT = "comment"
    CATEGORY = "category"
    TAG = "tag"
    MOBILE_DOC = "mobile_doc"
    API_REQUEST = "api_request"
    DATABASE_RECORD = "database_record"


class OutputFormat(Enum):
    """输出格式"""

    JSON = "json"
    CSV = "csv"
    SQL = "sql"
    YAML = "yaml"
    XML = "xml"


@dataclass
class DataGeneratorConfig:
    """数据生成器配置"""

    locale: str = "zh_CN"
    seed: Optional[int] = None
    output_dir: str = "./test_data"
    batch_size: int = 100
    include_relations: bool = True
    data_quality: str = "high"  # high, medium, low


class TestDataGenerator:
    """测试数据生成器"""

    def __init__(self, config: DataGeneratorConfig = None):
        self.config = config or DataGeneratorConfig()
        self.fake = Faker(self.config.locale)

        if self.config.seed:
            random.seed(self.config.seed)
            self.fake.seed(self.config.seed)

        # 创建输出目录
        Path(self.config.output_dir).mkdir(parents=True, exist_ok=True)

        # 数据模板
        self.templates = self._load_templates()

    def _load_templates(self) -> Dict[str, Dict[str, Any]]:
        """加载数据模板"""
        return {
            "user": {
                "id": "uuid4",
                "username": "user_name",
                "email": "email",
                "password": "password",
                "first_name": "first_name",
                "last_name": "last_name",
                "phone": "phone_number",
                "avatar": "image_url",
                "bio": "text",
                "created_at": "date_time",
                "updated_at": "date_time",
                "is_active": "boolean",
                "role": "choice",
            },
            "article": {
                "id": "uuid4",
                "title": "sentence",
                "content": "text",
                "excerpt": "text",
                "author_id": "uuid4",
                "category_id": "uuid4",
                "tags": "list",
                "status": "choice",
                "views": "random_int",
                "likes": "random_int",
                "created_at": "date_time",
                "updated_at": "date_time",
                "published_at": "date_time",
            },
            "mobile_doc": {
                "id": "uuid4",
                "title": "sentence",
                "content": "text",
                "category": "choice",
                "tags": "list",
                "author": "name",
                "is_hot": "boolean",
                "views": "random_int",
                "likes": "random_int",
                "created_at": "date_time",
                "updated_at": "date_time",
            },
            "api_request": {
                "method": "choice",
                "url": "url",
                "headers": "dict",
                "body": "dict",
                "query_params": "dict",
                "timestamp": "date_time",
                "response_time": "random_int",
                "status_code": "choice",
            },
        }

    def _generate_field_value(self, field_type: str, **kwargs) -> Any:
        """生成字段值"""
        if field_type == "uuid4":
            return self.fake.uuid4()
        elif field_type == "user_name":
            return self.fake.user_name()
        elif field_type == "email":
            return self.fake.email()
        elif field_type == "password":
            return self.fake.password(length=12)
        elif field_type == "first_name":
            return self.fake.first_name()
        elif field_type == "last_name":
            return self.fake.last_name()
        elif field_type == "phone_number":
            return self.fake.phone_number()
        elif field_type == "image_url":
            return self.fake.image_url()
        elif field_type == "text":
            return self.fake.text(max_nb_chars=kwargs.get("max_chars", 500))
        elif field_type == "sentence":
            return self.fake.sentence(nb_words=kwargs.get("nb_words", 6))
        elif field_type == "date_time":
            return self.fake.date_time_between(
                start_date=kwargs.get("start_date", "-1y"),
                end_date=kwargs.get("end_date", "now"),
            ).isoformat()
        elif field_type == "boolean":
            return self.fake.boolean()
        elif field_type == "choice":
            choices = kwargs.get("choices", ["option1", "option2"])
            return self.fake.random_element(elements=choices)
        elif field_type == "list":
            return [self.fake.word() for _ in range(kwargs.get("length", 3))]
        elif field_type == "dict":
            return {
                self.fake.word(): self.fake.word()
                for _ in range(kwargs.get("length", 3))
            }
        elif field_type == "url":
            return self.fake.url()
        elif field_type == "random_int":
            return self.fake.random_int(
                min=kwargs.get("min", 0), max=kwargs.get("max", 1000)
            )
        else:
            return self.fake.word()

    def _generate_record(self, template: Dict[str, Any], **kwargs) -> Dict[str, Any]:
        """生成单条记录"""
        record = {}

        for field_name, field_type in template.items():
            if isinstance(field_type, str):
                record[field_name] = self._generate_field_value(field_type, **kwargs)
            elif isinstance(field_type, dict):
                # 复杂字段类型
                record[field_name] = self._generate_field_value(
                    field_type.get("type", "word"), **field_type.get("kwargs", {})
                )

        return record

    def generate_users(self, count: int = 100, **kwargs) -> List[Dict[str, Any]]:
        """生成用户数据"""
        template = self.templates["user"]
        users = []

        # 设置角色选择
        template["role"] = {
            "type": "choice",
            "kwargs": {"choices": ["admin", "user", "moderator", "guest"]},
        }

        for _ in range(count):
            user = self._generate_record(template, **kwargs)
            users.append(user)

        return users

    def generate_articles(
        self, count: int = 100, users: List[Dict[str, Any]] = None, **kwargs
    ) -> List[Dict[str, Any]]:
        """生成文章数据"""
        template = self.templates["article"]
        articles = []

        # 设置状态选择
        template["status"] = {
            "type": "choice",
            "kwargs": {"choices": ["draft", "published", "archived"]},
        }

        # 设置标签
        template["tags"] = {"type": "list", "kwargs": {"length": 3}}

        for _ in range(count):
            article = self._generate_record(template, **kwargs)

            # 设置作者ID
            if users:
                article["author_id"] = random.choice(users)["id"]

            # 设置发布时间
            if article["status"] == "published":
                article["published_at"] = self.fake.date_time_between(
                    start_date="-1y", end_date="now"
                ).isoformat()
            else:
                article["published_at"] = None

            articles.append(article)

        return articles

    def generate_mobile_docs(self, count: int = 100, **kwargs) -> List[Dict[str, Any]]:
        """生成移动端文档数据"""
        template = self.templates["mobile_doc"]
        docs = []

        # 设置分类选择
        template["category"] = {
            "type": "choice",
            "kwargs": {
                "choices": ["frontend", "backend", "mobile", "ai", "devops", "design"]
            },
        }

        # 设置标签
        template["tags"] = {"type": "list", "kwargs": {"length": 3}}

        for _ in range(count):
            doc = self._generate_record(template, **kwargs)
            docs.append(doc)

        return docs

    def generate_api_requests(self, count: int = 100, **kwargs) -> List[Dict[str, Any]]:
        """生成API请求数据"""
        template = self.templates["api_request"]
        requests = []

        # 设置HTTP方法
        template["method"] = {
            "type": "choice",
            "kwargs": {"choices": ["GET", "POST", "PUT", "DELETE", "PATCH"]},
        }

        # 设置状态码
        template["status_code"] = {
            "type": "choice",
            "kwargs": {"choices": [200, 201, 400, 401, 403, 404, 500]},
        }

        # 设置响应时间
        template["response_time"] = {
            "type": "random_int",
            "kwargs": {"min": 10, "max": 5000},
        }

        for _ in range(count):
            request = self._generate_record(template, **kwargs)
            requests.append(request)

        return requests

    def generate_test_scenarios(self, count: int = 50) -> List[Dict[str, Any]]:
        """生成测试场景数据"""
        scenarios = []

        for _ in range(count):
            scenario = {
                "id": self.fake.uuid4(),
                "name": f"测试场景_{self.fake.word()}",
                "description": self.fake.text(max_nb_chars=200),
                "steps": [
                    {
                        "step": i + 1,
                        "action": self.fake.sentence(nb_words=4),
                        "expected": self.fake.sentence(nb_words=6),
                    }
                    for i in range(self.fake.random_int(min=3, max=10))
                ],
                "tags": [self.fake.word() for _ in range(3)],
                "priority": self.fake.random_element(
                    elements=["high", "medium", "low"]
                ),
                "created_at": self.fake.date_time_between(
                    start_date="-6m", end_date="now"
                ).isoformat(),
            }
            scenarios.append(scenario)

        return scenarios

    def generate_performance_data(self, count: int = 1000) -> List[Dict[str, Any]]:
        """生成性能测试数据"""
        performance_data = []

        for _ in range(count):
            data = {
                "timestamp": self.fake.date_time_between(
                    start_date="-1h", end_date="now"
                ).isoformat(),
                "endpoint": f"/api/{self.fake.word()}",
                "method": self.fake.random_element(
                    elements=["GET", "POST", "PUT", "DELETE"]
                ),
                "response_time": self.fake.random_int(min=10, max=5000),
                "status_code": self.fake.random_element(
                    elements=[200, 201, 400, 401, 500]
                ),
                "cpu_usage": self.fake.random_int(min=10, max=100),
                "memory_usage": self.fake.random_int(min=100, max=1000),
                "concurrent_users": self.fake.random_int(min=1, max=100),
                "throughput": self.fake.random_int(min=10, max=1000),
            }
            performance_data.append(data)

        return performance_data

    def export_data(
        self,
        data: List[Dict[str, Any]],
        filename: str,
        format: OutputFormat = OutputFormat.JSON,
    ) -> str:
        """导出数据到文件"""
        output_path = Path(self.config.output_dir) / filename

        if format == OutputFormat.JSON:
            with open(output_path.with_suffix(".json"), "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False, default=str)

        elif format == OutputFormat.CSV:
            import csv

            if data:
                with open(
                    output_path.with_suffix(".csv"), "w", newline="", encoding="utf-8"
                ) as f:
                    writer = csv.DictWriter(f, fieldnames=data[0].keys())
                    writer.writeheader()
                    writer.writerows(data)

        elif format == OutputFormat.SQL:
            sql_content = self._generate_sql_inserts(data, filename)
            with open(output_path.with_suffix(".sql"), "w", encoding="utf-8") as f:
                f.write(sql_content)

        elif format == OutputFormat.YAML:
            with open(output_path.with_suffix(".yaml"), "w", encoding="utf-8") as f:
                yaml.dump(data, f, default_flow_style=False, allow_unicode=True)

        return str(output_path)

    def _generate_sql_inserts(self, data: List[Dict[str, Any]], table_name: str) -> str:
        """生成SQL插入语句"""
        if not data:
            return ""

        columns = list(data[0].keys())
        sql_lines = []

        for record in data:
            values = []
            for col in columns:
                value = record.get(col)
                if value is None:
                    values.append("NULL")
                elif isinstance(value, str):
                    escaped_value = value.replace("'", "''")
                    values.append(f"'{escaped_value}'")
                elif isinstance(value, bool):
                    values.append("1" if value else "0")
                else:
                    values.append(str(value))

            sql_lines.append(
                f"INSERT INTO {table_name} ({', '.join(columns)}) VALUES ({', '.join(values)});"
            )

        return "\n".join(sql_lines)

    def generate_comprehensive_dataset(self) -> Dict[str, List[Dict[str, Any]]]:
        """生成综合数据集"""
        print("🚀 开始生成综合测试数据集...")

        # 生成用户数据
        print("👥 生成用户数据...")
        users = self.generate_users(100)

        # 生成文章数据
        print("📝 生成文章数据...")
        articles = self.generate_articles(200, users)

        # 生成移动端文档
        print("📱 生成移动端文档...")
        mobile_docs = self.generate_mobile_docs(150)

        # 生成API请求数据
        print("🌐 生成API请求数据...")
        api_requests = self.generate_api_requests(500)

        # 生成测试场景
        print("🎭 生成测试场景...")
        test_scenarios = self.generate_test_scenarios(50)

        # 生成性能数据
        print("⚡ 生成性能数据...")
        performance_data = self.generate_performance_data(1000)

        dataset = {
            "users": users,
            "articles": articles,
            "mobile_docs": mobile_docs,
            "api_requests": api_requests,
            "test_scenarios": test_scenarios,
            "performance_data": performance_data,
        }

        print(
            f"✅ 数据集生成完成，共 {sum(len(data) for data in dataset.values())} 条记录"
        )

        return dataset

    def export_comprehensive_dataset(
        self,
        dataset: Dict[str, List[Dict[str, Any]]],
        format: OutputFormat = OutputFormat.JSON,
    ):
        """导出综合数据集"""
        print(f"📤 导出数据集到 {self.config.output_dir}...")

        for data_type, data in dataset.items():
            filename = f"{data_type}_data"
            output_path = self.export_data(data, filename, format)
            print(f"✅ {data_type}: {output_path}")

        # 生成汇总报告
        summary = {
            "generated_at": datetime.now().isoformat(),
            "total_records": sum(len(data) for data in dataset.values()),
            "data_types": {data_type: len(data) for data_type, data in dataset.items()},
            "config": asdict(self.config),
        }

        summary_path = Path(self.config.output_dir) / "generation_summary.json"
        with open(summary_path, "w", encoding="utf-8") as f:
            json.dump(summary, f, indent=2, ensure_ascii=False)

        print(f"📊 生成汇总报告: {summary_path}")


def main():
    """主函数"""
    import argparse

    parser = argparse.ArgumentParser(description="AI-Code 测试数据生成器")
    parser.add_argument("--type", choices=[t.value for t in DataType], help="数据类型")
    parser.add_argument("--count", type=int, default=100, help="生成数量")
    parser.add_argument(
        "--format",
        choices=[f.value for f in OutputFormat],
        default="json",
        help="输出格式",
    )
    parser.add_argument("--output", default="./test_data", help="输出目录")
    parser.add_argument("--locale", default="zh_CN", help="语言环境")
    parser.add_argument("--seed", type=int, help="随机种子")
    parser.add_argument("--comprehensive", action="store_true", help="生成综合数据集")

    args = parser.parse_args()

    # 创建配置
    config = DataGeneratorConfig(
        locale=args.locale, seed=args.seed, output_dir=args.output
    )

    # 创建生成器
    generator = TestDataGenerator(config)

    if args.comprehensive:
        # 生成综合数据集
        dataset = generator.generate_comprehensive_dataset()
        generator.export_comprehensive_dataset(dataset, OutputFormat(args.format))
    else:
        # 生成指定类型数据
        if not args.type:
            print("❌ 请指定数据类型或使用 --comprehensive 生成综合数据集")
            return

        data_type = DataType(args.type)
        output_format = OutputFormat(args.format)

        # 生成数据
        if data_type == DataType.USER:
            data = generator.generate_users(args.count)
        elif data_type == DataType.ARTICLE:
            data = generator.generate_articles(args.count)
        elif data_type == DataType.MOBILE_DOC:
            data = generator.generate_mobile_docs(args.count)
        elif data_type == DataType.API_REQUEST:
            data = generator.generate_api_requests(args.count)
        else:
            print(f"❌ 不支持的数据类型: {data_type}")
            return

        # 导出数据
        output_path = generator.export_data(
            data, f"{data_type.value}_data", output_format
        )
        print(f"✅ 数据已导出: {output_path}")


if __name__ == "__main__":
    main()
