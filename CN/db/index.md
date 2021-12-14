# Magician-JDBC

Magician-JDBC，跟Magician-Web组件不一样，他不需要依赖Magician，可以完全的独立使用

## 初始化配置

### 导入依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-JDBC</artifactId>
    <version>2.0</version>
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

### 创建数据源

只需要在项目启动时执行一次即可

```java
// 创建数据源，示例中使用的是druid连接池，实际上支持任意实现了DataSource接口的连接池
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
        .addDataSource("dataSource", dataSource)// 添加数据源，这个方法可以调用多次，添加多个数据源
        .defaultDataSourceName("dataSource");// 设置默认数据源的名称
```

## 单表无SQL操作

### 插入数据

```java
ParamPO paramPO = new ParamPO();
paramPO.setUserName("a");
paramPO.setUserEmail("test@qq.com");

int result = JDBCTemplate.get().insert("表名", paramPO);
```

### 修改数据

```java
// 构建修改条件
List<Condition> conditionList = new ArrayList<>();
conditionList.add(Condition.get("id = ?", 4));

// 构建修改数据
ParamPO paramPO = new ParamPO();
paramPO.setUserName("a");
paramPO.setUserEmail("test@qq.com");

// 执行修改
int result = JDBCTemplate.get().update("表名", paramPO, conditionList);
```

### 删除数据

```java
// 构建删除条件
List<Condition> conditionList = new ArrayList<>();
conditionList.add(Condition.get("id = ?", 42));

// 执行删除
int result = JDBCTemplate.get().delete("表名", conditionList);
```

### 查询数据

```java
// 构建查询条件
List<Condition> conditionList = new ArrayList<>();
conditionList.add(Condition.get("id > ?", 10));
conditionList.add(Condition.get("and user_name != ?", "a"));
conditionList.add(Condition.get("order by create_time desc", Condition.NOT_WHERE));

// 执行查询
List<ParamPO> result = JDBCTemplate.get().select("xt_message_board", conditionList, ParamPO.class);
```

### 条件构造器说明

内部结构如下

```java
public class Condition {
    // 条件，可以是 where， order by， group by 等任意条件
    private String key;
    // 如果条件设置的是where条件，那么这个属性就需要设置成 条件的值
    private Object val;

    // 如果条件不是where，那么val就必须设置成这个常量
    public static final String NOT_WHERE = "notWhere";
}
```

可以看如下示例

```java
List<Condition> conditionList = new ArrayList<>();

// 这里key 设置成了where条件，所以val 就设置成了 where的值，也就是查询 id > 10 的数据
conditionList.add(Condition.get("id > ?", 10));

// 这里也一样的，是where条件，但是因为他是第二个条件，所以需要 在最前面加上and，or 等连接符
conditionList.add(Condition.get("and user_name != ?", "a"));

// 这是排序，所以 val需要设置成 Condition.NOT_WHERE
conditionList.add(Condition.get("order by create_time desc", Condition.NOT_WHERE));
```

注：条件构造器只支持 ? 占位符

## 自定义sql

### 增删改

```java
ParamPO paramPO = new ParamPO();
paramPO.setUserName("testTx222");
paramPO.setUserEmail("testTx222@qq.com");
paramPO.setId(4);

// 采用{}占位符的写法
int result = JDBCTemplate.get().exec("update xt_message_board set user_name = {user_name} , user_email = {user_email} where id = {id}", paramPO);

// 采用 ? 占位符的写法
int result = JDBCTemplate.get().exec("update xt_message_board set user_name = ? , user_email = ? where id = ?", new Object[]{"testTx222","testTx222@qq.com", 4});
```

### 查询数据

```java
ParamPO paramPO = new ParamPO();
paramPO.setId(5);
paramPO.setUserName("a");

// 采用{}占位符的写法
List<ParamPO> result = JDBCTemplate.get("dataSource").selectList("select * from xt_message_board where id > {id} and user_name != {user_name}", paramPO, ParamPO.class);

// 采用 ? 占位符的写法
List<ParamPO> result = JDBCTemplate.get("dataSource").selectList("select * from xt_message_board where id > ? and user_name != ?", new Object[]{5, "a"}, ParamPO.class);
```

### 分页查询

```java
// 查询条件
ParamPO paramPO = new ParamPO();
paramPO.setId(5);
paramPO.setUserName("a");

// 查询参数
PageParamModel pageParamModel = new PageParamModel();
pageParamModel.setCurrentPage(1);
pageParamModel.setPageSize(10);
pageParamModel.setParam(paramPO);

// 使用默认countSql查询
PageModel<ParamPO> pageModel =  JDBCTemplate.get().selectPage("select * from xt_message_board where id > {id} and user_name != {user_name}", pageParamModel, ParamPO.class);

// 使用自定义countSql查询
String countSql = "自己定义countSql";

PageModel<ParamPO> pageModel =  JDBCTemplate.get().selectPageCustomCountSql("select * from xt_message_board where id > {id} and user_name != {user_name}", countSql, pageParamModel, ParamPO.class);

```

## 事务管理

```java
// 开启事务
TransactionManager.beginTraction();

try {
    ParamPO paramPO = new ParamPO();
    paramPO.setUserName("testTx222");
    paramPO.setUserEmail("testTx222@qq.com");
    paramPO.setId(4);
    int result = JDBCTemplate.get().exec("update xt_message_board set user_name = {user_name} , user_email = {user_email} where id = {id}", paramPO);

    // 提交
    TransactionManager.commit();
} catch(Execption e){
    // 回滚
    TransactionManager.rollback();
}
```

## 实体映射

完全用的是Jackson的那一套的注解

```java
@JsonIgnoreProperties(ignoreUnknown = true)
public class TestPO{

    @JsonProperty(value = "数据库里的name字段名")
    private String name;
    @JsonProperty(value = "数据库里的age字段名")
    private String age;
    @JsonProperty(value = "数据库里的id字段名")
    private int id;

    @JsonProperty("create_time")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date createTime;

}
```

## Web管理

[点击此处 -> 跳转到web管理](/web/index.md)