# Magician文档

## Magician

### 运行环境

JDK11+

Maven中央库的Jar包 最低支持JDK11，但是源码最低支持JDK8，如果你需要在JDK8上运行，可以下载最新的tag 自己编译

### 引入依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician</artifactId>
    <version>2.0.2</version>
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
                .sendJson(200, "{'status':'ok'}");
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

### 创建WebSocketHandler(WebSocket服务)

```java
@WebSocketHandler(path = "/websocket")
public class DemoSocketHandler implements WebSocketBaseHandler {
   
    /**
     * 当连接进来时，触发这个方法
     */
    @Override
    public void onOpen(WebSocketSession webSocketSession) {
     
    }
    
    /**
     * 当连接断开时，触发这个方法
     */
    @Override
    public void onClose(WebSocketSession webSocketSession) {
        
    }

    /**
     * 当客户端发来消息时，触发这个方法
     */
    @Override
    public void onMessage(String message, WebSocketSession webSocketSession) {
        // 第一个参数 message 就是客户端发送过来的消息
    }
}
```

### 发送消息

```java
webSocketSession.sendString("send message");
```

### 启动服务

无论是HTTP服务 还是WebSocket服务，都是这么启动

```java
Magician.createHttp()
                    .scan("handler所在的包名")
                    .bind(8080);
```

## Magician-Web

### 引入依赖

在Magician项目的基础上 添加这个依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Web</artifactId>
    <version>2.0.1</version>
</dependency>
```

### 创建核心Handler

只允许有一个HttpHandler，这个Handler作为分发器，将请求分发给Controller

```java
@HttpHandler(path="/")
public class DemoHandler implements HttpBaseHandler {

    @Override
    public void request(MagicianRequest magicianRequest, MagicianResponse response) {
       try{
            // 主要是这句
            MagicianWeb.createWeb().request(magicianRequest);
        } catch (Exception e){
        }
    }
}
```

### 创建Controller

```java
@Route("/demoController")
public class DemoController {

	// 可以使用实体类接收参数，支持任意请求方式
	@Route(value = "/demo", requestMethod = ReqMethod.POST)
	public DemoVO demo(DemoVO demoVO){
		return demoVO;
	}

	// 也可以使用传统的方式接收参数，调用request里面的方法获取参数
    // 这里的接收方式，可以往上翻，看标题《接收参数》
    // 这种方式可以跟 上面提到的 实体类接收参数 混用
	@Route(value = "/demob", requestMethod = ReqMethod.POST)
	public String demob(MagicianRequest request){
        request.getParam("name");
		return "ok";
	}

	// 文件下载，只需要返回 ResponseInputStream 即可
	@Route(value = "/demob", requestMethod = ReqMethod.POST)
	public ResponseInputStream demob(){
		ResponseInputStream responseInputStream = new ResponseInputStream();
		responseInputStream.setName("file name");
		responseInputStream.setBytes(file bytes);
		return responseInputStream;
	}
}
```

### 修改扫描范围

- 扫描范围 需要包含【handler，controller，拦截器 所在的包名】
- 多个可以逗号分割，也可以直接配置成 他们的父包名

```java
Magician.createHttp()
                    .scan("handler，controller，拦截器 所在的包名")
                    .bind(8080);
```

### 传统方式接收参数

这里只是简单的列举一下，具体的可以看上面的标题《接收参数》

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

### 创建拦截器

创建一个普通的类，实现 MagicianInterceptor 接口即可

- 在类上面添加 @Interceptor(pattern = "*") 注解
- pattern属性为拦截规则，全部拦截 配置 * 即可，否则的话，必须以 / 开头
- 如果拦截器顺利放行的话，返回SUCCESS就好了，如果不给通过，那么直接返回 错误提示信息（返回对象会自定转成json）

```java
@Interceptor(pattern = "/demoController/*")
public class DemoInter implements MagicianInterceptor {

    /**
     * 接口执行之前
     * @param magicianRequest
     * @return
     */
    @Override
    public Object before(MagicianRequest magicianRequest) {
        System.out.println(magicianRequest);
        return SUCCESS;
    }

    /**
     * 接口执行之后
     * @param magicianRequest
     * @param o 接口返回的数据
     * @return
     */
    @Override
    public Object after(MagicianRequest magicianRequest, Object o) {
        System.out.println(o);
        return SUCCESS;
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

## 数据库操作

[点击此处 -> 跳转到数据库操作](/db/index.md)

