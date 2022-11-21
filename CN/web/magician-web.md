# Magician-Web

## 初始化配置

### 引入依赖

在Magician项目的基础上 添加这个依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Web</artifactId>
    <version>2.0.3</version>
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
            MagicianWeb.request(magicianRequest);
        } catch (Exception e){
        }
    }
}
```

### 修改扫描范围

- 扫描范围 需要包含【handler，controller，拦截器 所在的包名】
- 多个可以逗号分割，也可以直接配置成 他们的父包名

```java
Magician.createHttp()
    .scan("扫描范围需要包含 handler，controller，拦截器")
    .bind(8080);
```

## 正式使用

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

### 传统方式接收参数

这里只是简单的列举一下，具体的可以看上面的《接收参数》

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