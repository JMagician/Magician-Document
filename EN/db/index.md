# Magician-JDBC

Magician-JDBC，Unlike the Magician-Web component, it does not depend on Magician and can be used completely independently.

## Initial configuration

### Importing dependencies

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-JDBC</artifactId>
    <version>2.0.1</version>
</dependency>

<!-- mysql driver package -->
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <version>8.0.20</version>
</dependency>
<!-- druid connection pool -->
<dependency>
    <groupId>com.alibaba</groupId>
    <artifactId>druid</artifactId>
    <version>1.2.5</version>
</dependency>
```

### Creating a data source

Only needs to be executed once at project start

```java
// Create a data source, the example uses a druid connection pool and actually supports any connection pool that implements the DataSource interface
DruidDataSource dataSource = new DruidDataSource();

Properties properties = new Properties();
properties.put("druid.name", "dataSource");
properties.put("druid.url", "jdbc:mysql://127.0.0.1:3306/test?serverTimezone=Asia/Shanghai&useUnicode=true&characterEncoding=utf8&autoReconnect=true&rewriteBatchedStatements=true&useSSL=false");
properties.put("druid.username", "xxxx");
properties.put("druid.password", "xxxxx");
properties.put("druid.driverClassName", Driver.class.getName());

dataSource.setConnectProperties(properties);

// 创建MagicianJDBC
MagicianJDBC.createJDBC()
        .addDataSource("dataSource", dataSource)// Add data source, this method can be called multiple times to add multiple data sources
        .defaultDataSourceName("dataSource");// Set the name of the default data source
```

## Single table with no SQL operations

### Insert data

```java
ParamPO paramPO = new ParamPO();
paramPO.setUserName("a");
paramPO.setUserEmail("test@qq.com");

int result = JDBCTemplate.get().insert("table name", paramPO);
```

### Update data

```java
// Build modification conditions
List<Condition> conditionList = ConditionBuilder.createCondition()
        .add("id = ?", 10)
        .add("and name = ?", "bee"))
        .build();

// Build to modify data
ParamPO paramPO = new ParamPO();
paramPO.setUserName("a");
paramPO.setUserEmail("test@qq.com");

// Execute update
int result = JDBCTemplate.get().update("table name", paramPO, conditionList);
```

### Delete data

```java
// Build delete conditions
List<Condition> conditionList = ConditionBuilder.createCondition()
        .add("id = ?", 10)
        .build();

// Execute delete
int result = JDBCTemplate.get().delete("table name", conditionList);
```

### Select data

```java
// uild select conditions
List<Condition> conditionList = ConditionBuilder.createCondition()
            .add("id > ?", 10)
            .add("and (name = ? or age > ?)", "bee", 10))
            .add("order by create_time", Condition.NOT_WHERE))
            .build();

// Execute select
List<ParamPO> result = JDBCTemplate.get().select("table name", conditionList, ParamPO.class);
```

### Conditional Constructor Description

The internal structure is as follows

```java
public class Condition {
    // Conditions, which can be any condition such as where, order by, group by, etc.
    private String key;
    // If the condition is set to a where condition, then this property needs to be set to the value of the condition
    private Object[] val;

    // If the condition is not where, then val must be set to this constant
    public static final String NOT_WHERE = "notWhere";
}
```

An example can be seen below

```java
List<Condition> conditionList = ConditionBuilder.createCondition()
            // Here the key is set to the where condition, so the val is set to the where value, that is, the query id > 10 data
            .add("id > ?", 10)
            // It's the same here, it's a where condition, but because it's the second condition, it needs to be prefixed with an and, or, etc.
            .add("and (name = ? or age > ?)", "bee", 10))
            // This is sorted, so val needs to be set to Condition.NOT_WHERE
            .add("order by create_time", Condition.NOT_WHERE))
            .build();
```

Note: Conditional constructors only support ? placeholders

## Custom sql

### Insert, Delete, Update

```java
ParamPO paramPO = new ParamPO();
paramPO.setUserName("testTx222");
paramPO.setUserEmail("testTx222@qq.com");
paramPO.setId(4);

// Written using the {} placeholder
int result = JDBCTemplate.get().exec("update xt_message_board set user_name = {user_name} , user_email = {user_email} where id = {id}", paramPO);

// Written using the ? placeholder
int result = JDBCTemplate.get().exec("update xt_message_board set user_name = ? , user_email = ? where id = ?", new Object[]{"testTx222","testTx222@qq.com", 4});
```

### Select data

```java
ParamPO paramPO = new ParamPO();
paramPO.setId(5);
paramPO.setUserName("a");

// Written using the {} placeholder
List<ParamPO> result = JDBCTemplate.get("dataSource").selectList("select * from xt_message_board where id > {id} and user_name != {user_name}", paramPO, ParamPO.class);

// Written using the ? placeholder
List<ParamPO> result = JDBCTemplate.get("dataSource").selectList("select * from xt_message_board where id > ? and user_name != ?", new Object[]{5, "a"}, ParamPO.class);
```

### Paging select

```java
// Select condition
ParamPO paramPO = new ParamPO();
paramPO.setId(5);
paramPO.setUserName("a");

// Select param
PageParamModel pageParamModel = new PageParamModel();
pageParamModel.setCurrentPage(1);
pageParamModel.setPageSize(10);
pageParamModel.setParam(paramPO);

// Use the default countSql select
PageModel<ParamPO> pageModel =  JDBCTemplate.get().selectPage("select * from xt_message_board where id > {id} and user_name != {user_name}", pageParamModel, ParamPO.class);

// Using custom countSql select
String countSql = "自己定义countSql";

PageModel<ParamPO> pageModel =  JDBCTemplate.get().selectPageCustomCountSql("select * from xt_message_board where id > {id} and user_name != {user_name}", countSql, pageParamModel, ParamPO.class);

```

## Transaction Management

```java
// Begin Transaction
TransactionManager.beginTraction();

try {
    ParamPO paramPO = new ParamPO();
    paramPO.setUserName("testTx222");
    paramPO.setUserEmail("testTx222@qq.com");
    paramPO.setId(4);
    int result = JDBCTemplate.get().exec("update xt_message_board set user_name = {user_name} , user_email = {user_email} where id = {id}", paramPO);

    // commit Transaction
    TransactionManager.commit();
} catch(Execption e){
    // rollback Transaction
    TransactionManager.rollback();
}
```

### Transaction Isolation Level

```java
// Default is READ_COMMITTED
TransactionManager.beginTraction();

TransactionManager.beginTraction(TractionLevel.READ_COMMITTED);

TransactionManager.beginTraction(TractionLevel.READ_UNCOMMITTED);

TransactionManager.beginTraction(TractionLevel.REPEATABLE_READ);

TransactionManager.beginTraction(TractionLevel.SERIALIZABLE);
```

## Entity Mapping

All are jackson's annotations

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestPO{

    @JsonProperty(value = "Name field name in the database")
    private String name;
    @JsonProperty(value = "Name field age in the database")
    private String age;
    @JsonProperty(value = "Name field id in the database")
    private int id;

    @JsonProperty("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

}
```

## Web Management

[Click here -> Jump to web manager](/web/index.md)