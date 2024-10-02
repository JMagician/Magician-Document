# Magician文档

## Magician-Http

### 运行环境

JDK8+

### 引入依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician</artifactId>
    <version>2.0.7</version>
</dependency>

<!-- 这是日志包，必须有，不然控制台看不到东西，支持任意可以和slf4j桥接的日志包 -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.12</version>
</dependency>
```

### 创建Handler(HTTP服务)

```java
@HttpHandler(path="/demo")
public class DemoHandler implements HttpBaseHandler {

    @Override
    public void request(MagicianRequest request, MagicianResponse response) {
        // response data
        request.getResponse()
                .sendJson("{'status':'ok'}");
    }
}
```

### 接收参数

```java
// 根据参数名称 获取一个参数
request.getParam("param name");

// 获取参数名称相同的多个参数
request.getParams("param name");

// 根据参数名称 获取文件
request.getFile("param name");

// 获取参数名称相同的多个文件
request.getFiles("param name");

// 获取本次请求传输的所有文件，key为 参数名称
request.getFileMap();

// 如果本次请求时json传参，可以用这个方法获取json字符串
request.getJsonParam();

// 根据名称 获取请求头
request.getRequestHeader("header name");

// 获取所有请求头
request.getRequestHeaders();
```

### 响应参数

```java
// 响应文本数据
request.getResponse().sendText("");

// 响应html数据
request.getResponse().sendHtml("");

// 响应其他数据，这种方式需要 先设置响应头的Content-Type
request.getResponse().sendData("");

// 响应json数据
request.getResponse().sendJson("");

// 响应流数据，一般用作文件下载
request.getResponse().sendStream("");

// 响应错误数据，格式 {"code":500, "msg":""}
request.getResponse().sendErrorMsg(500, "");
```

### 创建WebSocketHandler(WebSocket服务)

```java
@WebSocketHandler(path = "/websocket")
public class DemoSocketHandler implements WebSocketBaseHandler {
   
    /**
     * 当连接进来时，触发这个方法
     */
    @Override
    public void onOpen(WebSocketSession webSocketSession) {
        // 给客户端发送消息
        webSocketSession.sendString("send message");
    }
    
    /**
     * 当连接断开时，触发这个方法
     */
    @Override
    public void onClose(WebSocketSession webSocketSession) {
        
    }

    /**
     * 当客户端发来消息时，触发这个方法
     * 第二个参数 message 就是客户端发送过来的消息
     */
    @Override
    public void onMessage(WebSocketSession webSocketSession, byte[] message) {
        System.out.println("收到了:" + new String(message));

        // 给客户端发送消息
        webSocketSession.sendString("send message");
    }
}
```

### 启动服务

无论是HTTP服务 还是WebSocket服务，都是这么启动

基础启动
```java
Magician.createHttp()
        .scan("com.test")// 扫描范围（包名）
        .bind(8080); // 监听的端口
```

自定义配置启动
```java
// 这段配置可以提取出去，不用跟下面的启动代码放在一起
MagicianConfig magicianConfig = new MagicianConfig();
magicianConfig.setNumberOfPorts(3); // 允许同时监听的端口数量，默认1个
magicianConfig.setBossThreads(1); // netty的boss线程数量 默认1个
magicianConfig.setWorkThreads(3); // netty的work线程数量 默认3个
magicianConfig.setNettyLogLevel(LogLevel.DEBUG); // netty的日志打印级别
magicianConfig.setMaxInitialLineLength(4096); // http解码器的构造参数1，默认4096 跟netty一样
magicianConfig.setMaxHeaderSize(8192); // http解码器的构造参数2，默认8192 跟netty一样
magicianConfig.setMaxChunkSize(8192); // http解码器的构造参数3，默认8192 跟netty一样


HttpServer httpServer = Magician.createHttp()
        .scan("com.test")// 扫描范围（包名）
        .setConfig(magicianConfig); // 添加配置

httpServer.bind(8080); // 监听端口

// 如果要监听多个端口
httpServer.bind(8081); 
httpServer.bind(8082); 
```

## Magician-Route

### 引入依赖

在Magician项目的基础上 添加这个依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Route</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 创建核心Handler

只允许有一个HttpHandler，这个Handler作为分发器，将请求分发给Route

```java
@HttpHandler(path="/")
public class DemoHandler implements HttpBaseHandler {

    @Override
    public void request(MagicianRequest magicianRequest, MagicianResponse response) {
       try{
            // 主要是这句
            MagicianRoute.request(magicianRequest);
        } catch (Exception e){
        }
    }
}
```

### 修改扫描范围

- 扫描范围 需要包含【handler，route，拦截器 所在的包名】
- 多个可以逗号分割，也可以直接配置成 他们的父包名

```java
Magician.createHttp()
    .scan("扫描范围需要包含 handler，route，拦截器")
    .bind(8080);
```

### 创建路由

- 这样的类可以创建多个，根据你的需求 将路由分开创建
- 每个路由内部，如果没有特别的需要 就不需要加try-catch，框架内部做了处理，一旦发生异常，会将异常信息以json的形式响应给客户端
- 直接返回需要响应的对象，框架会自动转成json并返回给客户端，你也可以采用如下示例中“Magician的原生响应方式” 将数据返回给客户端，具体可以看Magician文档的《响应参数》

```java
@Route
public class DemoRoute implements MagicianInitRoute {


    @Override
    public void initRoute(MagicianRouteCreate routeCreate) {

        routeCreate.get("/demo/getForm", request -> {
            return "{\"msg\":\"hello login\"}";
        });

        // Magician的原生响应方式
        routeCreate.get("/demo/getForm2", request -> {
            request.getResponse().sendJson("{\"msg\":\"hello login\"}");
            return null;
        });

        routeCreate.post("/demo/json", request -> {

            DemoResponseVo demoResponseVo = new DemoResponseVo();
            demoResponseVo.setName("Beerus");

            return demoResponseVo;
        });
    }

}
```

### 传统方式接收参数

这里只是简单的列举一下，具体的可以看Magician文档里面的《接收参数》

```java
// 获取 表单 以及 formData 提交的参数
request.getParam("参数name");

// formaData提交，获取文件
request.getFile("参数name");

// 获取请求头
request.getRequestHeader("请求头name");

// 获取json提交的参数
request.getJsonParam();
```

### 实体接收参数

```java
public class ParamVO {

    // ----- 字段名称 要跟 请求的参数name一致；如果是json传参，这个实体类只要跟json的结构保持一致即可-----

    // 普通参数
    private Integer id;
    private String name;
    private String[] ids

    // 文件参数
    private MixedFileUpload mixedFileUpload;
    private MixedFileUpload[] mixedFileUploads;

    // ----- 需要get, set，这里就不写了，节约点篇幅 -----
}
```

### 参数自动校验

在字段上 加上注解即可

```java
// 不可为空，且大小在10-100之间
@Verification(notNull = true, max = "100", min = "10", msg = "id不可为空且大小必须在10-100之间")
private Integer id;

// 正则校验
@Verification(reg = "^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,12}$",msg = "密码不可以为空且必须是6-12位数字字母组合")
private String password;
```

#### 属性解释

- notNull：是否为空，设置为true说明不可为空，对基本类型无效（不能赋值为null的类型都无效）
- max：最大值，只对int，double，float，BigDecimal等数字类型有效
- min：最小值，只对int，double，float，BigDecimal等数字类型有效
- msg：校验不通过的时候，返回前端的提示文字
- reg：正则表达式，只对String类型有效

### 将参数转化为实体对象

如果你想让实体类顺利的接收到参数，并且让参数验证生效，那么必须做如下步骤，
这种方式 底层是用的反射，如果你无法接受反射的性能，那么可以不用这种方式，选择权在你自己

- 只转化

```java
routeCreate.get("/demo/getForm", request -> {

    DemoVO demoVO = ConversionUtil.conversion(request, DemoVO.class);

    return "{\"msg\":\"hello login\"}";
});
```

- 转化+参数验证

如果验证失败，conversionAndVerification 方法会抛出一个异常，这个异常会自动被响应给客户端，不需要开发者处理

```java
routeCreate.get("/demo/getForm", request -> {

    DemoVO demoVO = ConversionUtil.conversionAndVerification(request, DemoVO.class);

    return "{\"msg\":\"hello login\"}";
});
```

如果你想获取到验证失败的提示信息 自己处理，可以用这种方式

```java
routeCreate.get("/demo/getForm", request -> {

    try {
        DemoVO demoVO = ConversionUtil.conversionAndVerification(request, DemoVO.class);
    } catch(VerificationException e){
        // 这个就是 验证失败的提示信息
        String msg = e.getMessage();
    }
    
    return "{\"msg\":\"hello login\"}";
});
```

### 创建拦截器

跟路由一样，这种类也可以创建多个，根据你的需求 分开创建拦截器

- 第一个参数为拦截规则，全部拦截 配置 * 即可，否则的话，必须以 / 开头
- 如果拦截器顺利放行的话，返回SUCCESS就好了，如果不给通过，那么直接返回 错误提示信息（返回对象会自定转成json）

```java
@Interceptor
public class DemoInter implements MagicianInitInterceptor {

    @Override
    public void initInterceptor(MagicianInterceptorCreate interceptorCreate) {

        interceptorCreate.addInterceptor("/demo/*", new MagicianInterceptor() {
            @Override
            public Object before(MagicianRequest magicianRequest) {
                System.out.println("进入了拦截器");
                return SUCCESS;
            }

            @Override
            public Object after(MagicianRequest magicianRequest, Object o) {
                return SUCCESS;
            }
        });

        interceptorCreate.addInterceptor("/*/form", new MagicianInterceptor() {
            @Override
            public Object before(MagicianRequest magicianRequest) {
                System.out.println("进入了拦截器2");
                return SUCCESS;
            }

            @Override
            public Object after(MagicianRequest magicianRequest, Object o) {
                return SUCCESS;
            }
        });
    }

}
```

### JWT管理

创建一个jwt管理对象， 每次builder都是一个新的对象，所以务必写一个静态的工具类来管理

```java
JwtManager jwtManager = JwtManager
            .builder()
            .setSecret("秘钥")
            .setCalendarField(Calendar.MILLISECOND) // 过期时间单位，默认：毫秒
            .setCalendarInterval(86400);// 过期时间，默认86400
```

创建token

```java
String token = jwtManager.createToken(要存入的对象);
```

还原token

```java
原对象类 原对象 = jwtManager.getObject("token字符串", 原对象类.class);
```

## Magician-Containers

### 引入依赖
```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Containers</artifactId>
    <version>1.0.1</version>
</dependency>
```

### 标记Bean

在类上面加一个注解即可，不可以用在 controller 上，也不是所有的类都需要变成一个 bean，开发者可以随意决定。

我们推荐：在你需要在这个类里面使用 AOP 或者定时任务的时候，才把它变成一个 bean。

```java
@MagicianBean
public class DemoBean {

}
```

### AOP

编写AOP的逻辑

```java
public class DemoAop implements BaseAop {

    /**
     * 方法执行前
     * @param args 被执行的方法的参数
     */
    public void startMethod(Object[] args) {
        
    }
    
    /**
     * 方法执行后
     * @param args 被执行的方法的参数
     * @param result 被执行的方法的返回数据
     */
    public void endMethod(Object[] args, Object result) {

    }
    
    /**
     * 方法执行出现异常
     * @param e 被执行的方法的异常信息
     */
    public void exp(Throwable e) {

    }
}
```

将逻辑挂到要监听的方法上

```java
@MagicianBean
public class DemoBean {

    @MagicianAop(className = DemoAop.class)
    public void demoAopMethod() {

    }
}
```

### 定时任务

```java
@MagicianBean
public class DemoBean {
    
    // loop 是轮训间隔，单位: 毫秒
    @MagicianTimer(loop=1000)
    public void demoTimerMethod() {

    }
}
```

### 初始化Bean

```java
@MagicianBean
public class DemoBean implements InitBean {
    
    public void init(){
        // 这个方法会在 所有Bean都创建好了以后自动执行
        // 可以将需要初始化的数据 和 逻辑 写在这里
    }
}
```

### 获取Bean对象

```java
@MagicianBean
public class DemoBeanTwo {

    private DemoBean demoBean = BeanUtil.get(DemoBean.class);
    
}
```

##  Magician-Configure

### 引入依赖
```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Configure</artifactId>
    <version>1.0.0</version>
</dependency>
```

### 加载配置文件

目前只支持 properties文件，你可以在任意目录下创建，然后使用以下方式将文件加载到项目中

从本机任意目录加载
```java
// 必须写文件的绝对路径
MagicianConfigure.load("/home/xxx/application.properties", ReadMode.EXTERNAL);
```

从当前项目的资源目录下加载

```java
// 类资源下的文件的路径
MagicianConfigure.load("/application.properties", ReadMode.LOCAL);
```

从远程目录加载

```java
// 远程文件路径, 只支持http协议
MagicianConfigure.load("https://www.test.com/application.properties", ReadMode.REMOTE);
```

### 获取配置数据

```java
// 如果配置文件里有userName这个key，那么就会直接使用，如果没有 那么会去环境变量读取
String userName = Environment.get("userName");
```

## 更多功能

- [点击此处 -> 跳转到数据库操作](/db/index.md)

