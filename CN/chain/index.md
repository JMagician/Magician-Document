# Magician-Web3

Magician-web3是一个区块链开发工具包。它由两个功能组成。一个是扫描区块链，根据开发者的需要监控交易。另一个是对web3j的一些二次打包，可以减少开发者在一些常见场景下的工作量。它计划支持三种链，ETH（BSC、POLYGAN等）、SOL和TRON

他不需要依赖Magician，可以完全的独立使用

## 初始化配置

### 导入依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Web3</artifactId>
    <version>1.0.1</version>
</dependency>

<!-- This is the logging package, you must have it or the console will not see anything, any logging package that can bridge with slf4j is supported -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.12</version>
</dependency>
```

## 扫块，监听交易事件

### 创建一个监听器

监听器 可以创建多个，根据你的需求 分别设置监听条件

#### ETH(BSC, POYGAN 等)监听器
```java
/**
 * 创建一个类，实现 EthMonitorEvent接口 即可
 */
public class EventDemo implements EthMonitorEvent {

    /**
     * 筛选条件，如果遇到了符合条件的交易，会自动触发 call方法
     * 这些条件都是 并且的关系，必须要同时满足才行
     * 如果不想根据某个条件筛选，直接不给那个条件设置值就好了
     * 这个方法如果不实现，或者返回null， 那么就代表监听任意交易
     */
    @Override
    public EthMonitorFilter ethMonitorFilter() {
        return EthMonitorFilter.builder()
                .setFromAddress("0x131231249813d334C58f2757037F68E2963C4crc") // 筛选 fromAddress 发送的交易
                .setToAddress("0x552115849813d334C58f2757037F68E2963C4c5e") // 筛选 toAddress 或 合约地址 收到的交易
                .setMinValue(BigInteger.valueOf(1)) // 筛选发送的主链币数量 >= minValue 的交易
                .setMaxValue(BigInteger.valueOf(10)) // 筛选发送的主链币数量 <= maxValue 的交易
                .setFunctionCode("0xasdas123"); // 筛选调用合约内 某方法 的交易
    }

    /**
     * 如果遇到了符合上面条件的交易，就会触发这个方法
     * transactionModel.getEthTransactionModel() 是一个交易对象，内部包含hash，value，from，to 等 所有的数据
     */
    @Override
    public void call(TransactionModel transactionModel) {
        String template = "EventOne 扫描到了, hash:{0}, from:{1}, to: {2}, input: {3}";
        template = template.replace("{0}", transactionModel.getEthTransactionModel().getBlockHash());
        template = template.replace("{1}", transactionModel.getEthTransactionModel().getFrom());
        template = template.replace("{2}", transactionModel.getEthTransactionModel().getTo());
        template = template.replace("{3}", transactionModel.getEthTransactionModel().getInput());

        System.out.println(template);
    }
}
```

#### SOL, TRON 链的扫块正在开发中......

```java
开发中......
```

### 开启一个扫块任务

```java

// 初始化线程池，核心线程数必须 >= 扫块的任务数量，建议等于扫块的任务数量
EventThreadPool.init(1);

// 开启一个扫块任务，如果你想扫描多个链，那么直接拷贝这段代码，并修改配置即可
MagicianBlockchainScan.create()
        .setRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/") // 节点的RPC地址
        .setChainType(ChainType.ETH) // 要扫描的链（如果设置成ETH，那么可以扫描BSC, POLYGAN 等其他任意 以太坊标准的链）
        .setScanPeriod(5000) // 每轮扫描的间隔
        .setScanSize(1000) // 每轮扫描的块数
        .setBeginBlockNumber(BigInteger.valueOf(24318610)) // 从哪个块高开始扫描
        .addEthMonitorEvent(new EventOne()) // 添加 监听事件
        .addEthMonitorEvent(new EventTwo()) // 添加 监听事件
        .addEthMonitorEvent(new EventThree()) // 添加 监听事件
        .start();

// TODO 暂时不支持SOL和TRON， 正在开发中......
```

使用代理访问RPC地址

```java
// 使用 setRpcUrl 方法的另一个重载，传入代理设置即可
MagicianBlockchainScan.create()
        .setRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/",
                    new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4780))) 
        .start();

// ---------- 除了上面那种以外，setRpcUrl 方法一共有这么几种重载，根据你的需求挑选合适的方法 ----------

// 直接传入 wei3j的HttpService
// 这种方法 可定制化最高，基本上就是web3j本来的使用方式
MagicianBlockchainScan.create()
        .setRpcUrl(new HttpService("")) 
        .start();

// 传入okHttpClient
// 这种方法 可定制化程度也非常高，基本上就是使用okHttp访问 区块链节点了
OkHttpClient okHttpClient = xxxxxx;

MagicianBlockchainScan.create()
        .setRpcUrl(okHttpClient) 
        .start();

// 有些代理服务器 需要鉴权，可以使用这种方式来设置用户名和密码
MagicianBlockchainScan.create()
                    .setRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/",
                            new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4780)),
                            (Route route, Response response) -> {

                                //设置代理服务器账号密码
                                String credential = Credentials.basic("用户名", "密码");
                                return response.request().newBuilder()
                                        .header("Proxy-Authorization", credential)
                                        .build();
                            }
                    )
```

## Web3j 扩展

在Web3j 的基础上进行了二次封装，扩展了几个基础的方法，可以在一定程度上减轻开发者的工作量

### 主链币查询以及转账

```java
String privateKey = ""; // 私钥
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-1-s1.binance.org:8545/")); // 链的RPC地址

// 这种方式是单例的
EthHelper ethHelper =  MagicianWeb3.getEthBuilder().getEth(web3j, privateKey);
// 如果你想创建多个EthHelper对象，可以用这种方式
EthHelper ethHelper = EthHelper.builder(web3j, privateKey);

// 余额查询
BigInteger balance = ethHelper.balanceOf(fromAddress);

// 转账
TransactionReceipt transactionReceipt = ethHelper.transfer(
            toAddress,
            BigDecimal.valueOf(1),
            Convert.Unit.ETHER
);
```

### InputData 编解码

```java
// 这种方式是单例的
EthAbiCodec ethAbiCodec = MagicianWeb3.getEthBuilder().getEthAbiCodec();
// 如果你想创建多个EthAbiCodec对象，可以直接new
EthAbiCodec ethAbiCodec = new EthAbiCodec();

// 编码
String inputData = ethAbiCodec.getInputData(
            "transfer", // 方法名
            new Address(toAddress), // 参数1
            new Uint256(new BigInteger("1000000000000000000")) // 参数2，如果还有其他参数，可以继续传入下一个
    );

// 解码
List<Type> result = ethAbiCodec.decoderInputData(
            "0x" + inputData.substring(10), // 去除方法签名的inputData
            new TypeReference<Address>() {}, // 被编码的方法的参数1 类型
            new TypeReference<Uint256>() {} // 被编码的方法的参数2 类型， 如果还有其他参数，可以继续传入下一个
    );

for(Type type : result){
    System.out.println(type.getValue());
}

// 获取方法签名，其实就是inputData的前十位
String functionCode = ethAbiCodec.getFunAbiCode(
            "transfer", // 方法名
            new Address(toAddress), // 参数1，值随意传，反正我们要的方法签名，不是完整的inputData
            new Uint256(new BigInteger("1000000000000000000")) // 参数2，值随意传，反正我们要的方法签名，不是完整的inputData，如果还有其他参数，可以继续传入下一个
    );
```

### 合约查询 以及 写入

```java
String privateKey = ""; // 私钥
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-1-s1.binance.org:8545/")); // 链的RPC地址

// 这种方式是单例的
EthContract ethContract = MagicianWeb3.getEthBuilder().getEthContract(web3j, fromAddressPrivateKey);
// 如果你想创建多个EthContract对象，可以用这种方式
EthContract ethContract = EthContract.builder(web3j, privateKey);


EthAbiCodec ethAbiCodec = MagicianWeb3.getEthBuilder().getEthAbiCodec();

// 查询
List<Type> result = ethContract.select(
            contractAddress, // 合约地址
            ethAbiCodec.getInputData(
                    "balanceOf", // 要调用的方法名称
                    new Address(toAddress) // 方法的参数，如果有多个，可以继续传入下一个参数
            ),  // 要调用的方法的inputData
            new TypeReference<Uint256>() {} // 方法的返回类型，如果有多个返回值，可以继续传入下一个参数
        );

// 往合约里写入数据
// gasPrice，gasLimit 两个参数，如果想用默认值可以不传，或者传null
// 如果不传的话，两个参数都必须不传，要传就一起传， 如果设置为null的话，可以一个为null，一个有值
SendResultModel sendResultModel = ethContract.sendRawTransaction(
                    fromAddress, // 调用者的地址
                    contractAddress, // 合约地址
                    new BigInteger("1200000"), // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                    new BigInteger("800000"), // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
                    ethAbiCodec.getInputData(
                            "transfer", // 要调用的方法名称
                            new Address(toAddress), // 方法的参数，如果有多个，可以继续传入下一个参数
                            new Uint256(new BigInteger("1000000000000000000")) // 方法的参数，如果有多个，可以继续传入下一个参数
                    ) // 要调用的方法的inputData
            );

sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果
```

## 项目内置了几个functionCode

如果你刚好要监听这几个函数，那么可以直接用，前提是你的合约里的函数必须跟 Openzeppelin 的规范一样，连参数列表的顺序都必须一样

### ERC20

```java
ERC20.TRANSFER.getFunctionCode();
ERC20.APPROVE.getFunctionCode();
ERC20.TRANSFER_FROM.getFunctionCode();
```

### ERC721

```java
ERC721.SAFE_TRANSFER_FROM.getFunctionCode();
ERC721.SAFE_TRANSFER_FROM_TWO.getFunctionCode(); // 没有data的那个
ERC721.TRANSFER_FROM.getFunctionCode();
ERC721.APPROVE.getFunctionCode();
ERC721.SET_APPROVAL_FOR_ALL.getFunctionCode();
```

### ERC1155

```java
ERC1155.SET_APPROVAL_FOR_ALL.getFunctionCode();
ERC1155.SAFE_TRANSFER_FROM.getFunctionCode();
ERC1155.SAFE_BATCH_TRANSFER_FROM.getFunctionCode();
```