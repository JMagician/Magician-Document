# Magician-Blockchain

## Magician-Scanning
Magician-Scanning是一个用Java开发的扫描区块链的工具包，当我们在程序中需要一些功能时，它可以派上用场，比如说。

- 当一个地址收到ETH时，程序中的一个方法会被自动触发，这个交易会被传入该方法。

- 当一个合约的某个功能被调用时（比如ERC20转账），它会自动触发程序中的一个方法，并将这个交易传递给这个方法。它甚至可以只在代币被转移到指定地址时被触发。

- 当程序需要保留一个区块高度开始以来的所有交易记录时，也可以使用这个工具包。

它计划支持三种链，ETH（BSC，POLYGON等），SOL和TRON

### 导入依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Scanning</artifactId>
    <version>1.0.11</version>
</dependency>

<!-- This is the logging package, you must have it or the console will not see anything, any logging package that can bridge with slf4j is supported -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.12</version>
</dependency>
```

### ETH(BSC, POYGAN 等)链

#### 创建监听器

监听器 可以创建多个，根据你的需求 分别设置监听条件

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
                .setInputDataFilter( // 根据inputData筛选
                        InputDataFilter.builder()
                                .setFunctionCode(ERC20.TRANSFER.getFunctionCode()) // 函数签名（被调用的合约内的某方法）, 支持任意函数，这里的枚举只是一部分标准的合约函数
                                .setTypeReferences( // 此方法的参数列表（仅类型）
                                        new TypeReference<Address>(){},
                                        new TypeReference<Uint256>(){}
                                )
                                .setValue("0x552115849813d334C58f2757037F68E2963C4c5e", null)// 筛选第几个参数 = 什么值
                );
    }

    /**
     * 如果遇到了符合上面条件的交易，就会触发这个方法
     * transactionModel.getEthTransactionModel() 是一个交易对象，内部包含hash，value，from，to 等 所有的数据
     */
    @Override
    public void call(TransactionModel transactionModel) {
        // 符合条件的交易记录
        EthBlock.TransactionObject transactionObject = transactionModel.getEthTransactionModel().getTransactionObject();

        // 本条交易记录所在的块信息
        EthBlock ethBlock = transactionModel.getEthTransactionModel().getEthBlock();
    }
}
```

#### InputDataFilter 详解

如果你想监控，某合约内的某函数 被调用的交易

```java
public EthMonitorFilter ethMonitorFilter() {
        return EthMonitorFilter.builder()
                .setToAddress("0x552115849813d334C58f2757037F68E2963C4c5e") // 合约地址
                .setInputDataFilter( // 根据inputData筛选
                        InputDataFilter.builder()
                                .setFunctionCode("0xadasasdf") // 被调用的函数编码（inputData前十位）
                );
}
```

如果 有一个合约[0x552115849813d334C58f2757037F68E2963C4c5e], 里面有一个函数是 transferFrom(address from, address to, uint256 amount)

你想 实现一个监控：如果有人用这个合约里的这个函数，将代币转给[0x552115849813d334C58f2757037F68E2963C4c5e]时，就触发 Monitor事件，那么你可以这样写

```java
public EthMonitorFilter ethMonitorFilter() {
        return EthMonitorFilter.builder()
                .setToAddress("0x552115849813d334C58f2757037F68E2963C4c5e") // 合约地址
                .setInputDataFilter( // 根据inputData筛选
                        InputDataFilter.builder()
                                .setFunctionCode(ERC20.TRANSFER_FROM.getFunctionCode()) // 被调用的函数编码（inputData前十位）
                                .setTypeReferences( // 此方法的参数列表（仅类型）
                                        new TypeReference<Address>(){}, // 第一个参数的类型
                                        new TypeReference<Address>(){}, // 第二个参数的类型
                                        new TypeReference<Uint256>(){} // 第三个参数的类型
                                )
                                .setValue(null, "0x552115849813d334C58f2757037F68E2963C4c5e", null)// 筛选第二个参数（to） = 0x552115849813d334C58f2757037F68E2963C4c5e
                );
}
```

#### 开启一个扫块任务

```java

// 初始化线程池，核心线程数必须 >= 全局的扫块的任务数量 + 全局的重试策略的数量
// 这是一个全局配置，不管你开了几个任务，不管你需要扫描几条链，几种链，都只需要写一次这句代码
EventThreadPool.init(1);

// 开启一个扫块任务，如果你想扫描多个链，那么直接拷贝这段代码，并修改配置即可
MagicianBlockchainScan.create()
        .setRpcUrl(
                EthRpcInit.create()
                        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545")
        ) // 节点的RPC地址
        .setScanPeriod(5000) // 间隔多久，扫描下一个区块
        .setBeginBlockNumber(BigInteger.valueOf(24318610)) // 从哪个块高开始扫描
        .addEthMonitorEvent(new EventOne()) // 添加 监听事件
        .addEthMonitorEvent(new EventTwo()) // 添加 监听事件
        .addEthMonitorEvent(new EventThree()) // 添加 监听事件
        .start();
```

#### 使用代理访问RPC地址

```java
// 使用 addRpcUrl 方法的另一个重载，传入代理设置即可
EthRpcInit.create()
        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/",
                    new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4780)))

// ---------- 除了上面那种以外，addRpcUrl 方法一共有这么几种重载，根据你的需求挑选合适的方法 ----------

// 直接传入 wei3j的HttpService
// 这种方法 可定制化最高，基本上就是web3j本来的使用方式
EthRpcInit.create()
        .addRpcUrl(new HttpService(""))

// 传入okHttpClient
// 这种方法 可定制化程度也非常高，基本上就是使用okHttp访问 区块链节点了
OkHttpClient okHttpClient = xxxxxx;
EthRpcInit.create()
        .addRpcUrl(okHttpClient)

// 有些代理服务器 需要鉴权，可以使用这种方式来设置用户名和密码
EthRpcInit.create()
        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/",
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

### TRON链

#### 创建监听器

条件过滤器还在开发中，可以关注后续更新，call方法会接收到所有扫描到的交易信息，需要您自己判断筛选

```java
/**
 * 创建一个类，实现TronMonitorEvent接口即可
 */
public class TronEventOne implements TronMonitorEvent {

        /**
         * transactionModel 对象里包含此条交易的所有信息
         */
        @Override
        public void call(TransactionModel transactionModel) {
                System.out.println("TRON 成功了！！！");
                System.out.println("TRON, txID: " + transactionModel.getTronTransactionModel().getTxID());
        }

}
```

#### 开启一个扫块任务

下面标出了跟ETH扫块任务的两个区别，除此之外，再无其他区别

```java
// 初始化线程池，核心线程数必须 >= 全局的扫块的任务数量 + 全局的重试策略的数量
// 这是一个全局配置，不管你开了几个任务，不管你需要扫描几条链，几种链，都只需要写一次这句代码
EventThreadPool.init(1);

MagicianBlockchainScan.create()
        .setRpcUrl(
                // 跟ETH的区别一，这里需要用TronRpcInit
                TronRpcInit.create()
                        .addRpcUrl("https://api.shasta.trongrid.io/wallet")
        )
        .addTronMonitorEvent(new TronEventOne()) // 跟ETH的区别二，添加监听器需要用 addTronMonitorEvent
        .start();
```

#### 使用代理访问RPC地址

```java
开发中......
```

### SOLANA链

```java
开发中......
```

### 停止某一个扫块任务

三条链都是一样的写法

```java
// 将对象拿到
MagicianBlockchainScan blockChainScan = MagicianBlockchainScan.create()
        .setRpcUrl(
                EthRpcInit.create()
                        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545")
        ) // 节点的RPC地址
        .setScanPeriod(5000) // 间隔多久，扫描下一个区块
        .setBeginBlockNumber(BigInteger.valueOf(24318610)) // 从哪个块高开始扫描
        .addEthMonitorEvent(new EventOne()) // 添加 监听事件
        .addEthMonitorEvent(new EventTwo()) // 添加 监听事件
        .addEthMonitorEvent(new EventThree()); // 添加 监听事件

// 因为start方法没有返回值，所以上面的链式不可以调用start，需要改成用返回的对象来调用
blockChainScan.start();

// 调用这个方法可以停止这一个扫块任务
blockChainScan.shutdown();
```

### 配置多个RPC URL 实现负载均衡

三条链都是一样的，只是EthRpcInit 需要改成对应的链的类

调用addRpcUrl方法多次，传入多个RPC URL，即可实现负载均衡（轮询）

```java
MagicianBlockchainScan.create()
        .setRpcUrl(
                EthRpcInit.create()
                        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545")
                        .addRpcUrl("https://data-seed-prebsc-2-s1.binance.org:8545")
                        .addRpcUrl("https://data-seed-prebsc-1-s2.binance.org:8545")
        ) // 节点的RPC地址
```

### 重试策略（三条链都是一样的写法）

在符合以下两个条件时，会发生重试，两个条件必须全都符合 才会触发重试
1. 当前正在扫描的块高 是空的（块不存在 或者 块里面没交易）
2. 当前正在扫描的块高 < 链上的最新块高

当上面两个条件同时符合的时候，扫描任务会跳过这个块，然后继续扫描下一个块，同时 重试策略会收到被跳过的块高，
你可以在重试策略里 自己处理

#### 创建一个重试策略
```java
public class EthRetry implements RetryStrategy {

    @Override
    public void retry(BigInteger blockNumber) {
        
    }
}
```

#### 将重试策略添加到扫描任务中
```java
MagicianBlockchainScan.create()
        .setRetryStrategy(new EthRetry())// 调用这个方法添加
        .start();
```

#### 需要注意线程数量的配置

如果你此时开了一个扫块任务 + 一个 重试策略，那么需要占用两个线程，所以参数必须传2

```java
// 初始化线程池，核心线程数必须 >= 全局的扫块的任务数量 + 全局的重试策略的数量
// 这是一个全局配置，不管你开了几个任务，不管你需要扫描几条链，几种链，都只需要写一次这句代码
EventThreadPool.init(2);
```

### InputData 编解码

#### ETH(BSC, POYGAN 等)链
```java
// 编码
String inputData = EthAbiCodec.getInputData(
            "transfer", // 方法名
            new Address(toAddress), // 参数1
            new Uint256(new BigInteger("1000000000000000000")) // 参数2，如果还有其他参数，可以继续传入下一个
    );

// 解码
List<Type> result = EthAbiCodec.decoderInputData(
            "0x" + inputData.substring(10), // 去除方法签名的inputData
            new TypeReference<Address>() {}, // 被编码的方法的参数1 类型
            new TypeReference<Uint256>() {} // 被编码的方法的参数2 类型， 如果还有其他参数，可以继续传入下一个
    );

for(Type type : result){
    System.out.println(type.getValue());
}

// 获取方法签名，其实就是inputData的前十位
String functionCode = EthAbiCodec.getFunAbiCode(
            "transfer", // 方法名
            new Address(toAddress), // 参数1，值随意传，反正我们要的方法签名，不是完整的inputData
            new Uint256(new BigInteger("1000000000000000000")) // 参数2，值随意传，反正我们要的方法签名，不是完整的inputData，如果还有其他参数，可以继续传入下一个
    );
```

#### TRON

```java
开发中......
```

#### SOLANA

```java
开发中......
```

### 项目内置了几个functionCode（ETH专用）

如果你刚好要监听这几个函数，那么可以直接用，前提是你的合约里的函数必须跟 Openzeppelin 的规范一样，连参数列表的顺序都必须一样

#### ERC20

```java
ERC20.TRANSFER.getFunctionCode();
ERC20.APPROVE.getFunctionCode();
ERC20.TRANSFER_FROM.getFunctionCode();
```

#### ERC721

```java
ERC721.SAFE_TRANSFER_FROM.getFunctionCode();
ERC721.SAFE_TRANSFER_FROM_TWO.getFunctionCode(); // 没有data的那个
ERC721.TRANSFER_FROM.getFunctionCode();
ERC721.APPROVE.getFunctionCode();
ERC721.SET_APPROVAL_FOR_ALL.getFunctionCode();
```

#### ERC1155

```java
ERC1155.SET_APPROVAL_FOR_ALL.getFunctionCode();
ERC1155.SAFE_TRANSFER_FROM.getFunctionCode();
ERC1155.SAFE_BATCH_TRANSFER_FROM.getFunctionCode();
```

## Magician-ContractsTools

Magician-ContractsTools是一个用于调用智能合约的工具包，你可以非常容易地在Java程序中调用智能合约进行查询和写入操作。

有三个内置的标准合约模板，分别是ERC20、ERC721和ERC1155，如果你需要调用这三个合约中的标准函数，可以帮助你非常快速地完成工作。除了内置的合同模板外，如果你需要调用自定义的合同函数也是很容易的，以后我们还会继续增加标准模板。

此外，还有InputData解码和ETH查询和转移的工具

计划支持三种链，ETH（BSC、POLYGON等）、SOL和TRON

### 导入依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-ContractsTools</artifactId>
    <version>1.0.2</version>
</dependency>

<!-- This is the logging package, you must have it or the console will not see anything, any logging package that can bridge with slf4j is supported -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.12</version>
</dependency>
```

### 合约查询 以及 写入

初始化合约工具对象

```java
String privateKey = ""; // 私钥
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-1-s1.binance.org:8545/")); // 链的RPC地址

String contractAddress = "";

EthContractUtil ethContractUtil = EthContractUtil.builder(web3j);
```

查询合约

```java
List<Type> result = ethContractUtil.select(
            contractAddress, // 合约地址
            EthAbiCodecTool.getInputData(
                    "balanceOf", // 要调用的方法名称
                    new Address(toAddress) // 方法的参数，如果有多个，可以继续传入下一个参数
            ),  // 要调用的方法的inputData
            new TypeReference<Uint256>() {} // 方法的返回类型，如果有多个返回值，可以继续传入下一个参数
        );
```

写入合约

```java
// 往合约里写入数据
SendResultModel sendResultModel = ethContractUtil.sendRawTransaction(
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setToAddress(contractAddress) // 合约地址
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
                        .setNonce(new BigInteger("100")), // 自定义nonce，如果想要默认值 可以直接传null，或者不传这个参数
                EthAbiCodecTool.getInputData(
                        "transfer", // 要调用的方法名称
                        new Address(toAddress), // 方法的参数，如果有多个，可以继续传入下一个参数
                        new Uint256(new BigInteger("1000000000000000000")) // 方法的参数，如果有多个，可以继续传入下一个参数
                ) // 要调用的方法的inputData
            );

sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果
```

### 合约模板

目前只有三种模板，后面会继续增加

#### 调用ERC20合约

初始化合约模板

```java
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-2-s1.binance.org:8545"));

String contractAddress = "";

ERC20Contract erc20Contract = ERC20Contract.builder(web3j, contractAddress);
```

查询

```java
// 调用合约的 totalSupply 函数
BigInteger total = erc20Contract.totalSupply();

// 调用合约的 balanceOf 函数
BigInteger amount = erc20Contract.balanceOf("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84");

// 调用合约的 allowance 函数
BigInteger amount = erc20Contract.allowance("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", "0x552115849813d334C58f2757037F68E2963C4c5e");
```

写入

```java
// 调用合约的 transfer 函数
SendResultModel sendResultModel = erc20Contract.transfer(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 转账接收人
                new BigInteger("1000000000000000000"), // 转账金额
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果

// 调用合约的 transferFrom 函数
SendResultModel sendResultModel = erc20Contract.transferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // 转账付款人
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 转账接收人
                new BigInteger("1000000000000000000"), // 转账金额
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果

// 调用合约的 approve 函数
SendResultModel sendResultModel = erc20Contract.approve(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 被授权人
                new BigInteger("1000000000000000000"), // 授权金额
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果
```

#### 调用ERC721合约

初始化合约模板

```java
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-2-s1.binance.org:8545"));

String contractAddress = "";

ERC721Contract erc721Contract = ERC721Contract.builder(web3j, contractAddress);
```

查询

```java
// 调用合约的 balanceOf 函数
BigInteger amount = erc20Contract.balanceOf("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84");

// 调用合约的 ownerOf 函数
String ownerAddress = erc721Contract.ownerOf(new BigInteger("1002"));

// 调用 isApprovedForAll 函数
Boolean result = erc1155Contract.isApprovedForAll("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", "0x552115849813d334C58f2757037F68E2963C4c5e");

// 调用 getApproved 函数
String approvedAddress = erc721Contract.getApproved(new BigInteger("1002"));
```

写入

```java
// 调用 approve 函数
SendResultModel sendResultModel = erc721Contract.approve(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 被授权人
                new BigInteger("1002"), // 授权的tokenId
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果

// 调用合约的 transferFrom 函数
SendResultModel sendResultModel = erc20Contract.transferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // 转账付款人
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 转账接收人
                new BigInteger("1002"), // tokenId
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果

// 调用合约的 safeTransferFrom 函数(没有data参数的那个)
SendResultModel sendResultModel = erc20Contract.safeTransferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // 转账付款人
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 转账接收人
                new BigInteger("1002"), // tokenId
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果

// 调用合约的 safeTransferFrom 函数(有data参数的那个)
SendResultModel sendResultModel = erc20Contract.safeTransferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // 转账付款人
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 转账接收人
                new BigInteger("1002"), // tokenId
                new byte[0], // data
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果

// 调用 setApprovalForAll 函数
SendResultModel sendResultModel = erc1155Contract.setApprovalForAll(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 被授权人
                true, // 是否授权全部
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果
```

#### 调用ERC1155合约

初始化合约模板

```java
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-2-s1.binance.org:8545"));

String contractAddress = "";

ERC1155Contract erc1155Contract = ERC1155Contract.builder(web3j, contractAddress);
```

查询

```java
// 调用 balanceOf 函数
BigInteger amount = erc1155Contract.balanceOf("0x552115849813d334C58f2757037F68E2963C4c5e", new BigInteger("0"));

// 调用 balanceOfBatch 函数
List<String> address = new ArrayList<>();
address.add("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84");
address.add("0x552115849813d334C58f2757037F68E2963C4c5e");

List<BigInteger> tokenId = new ArrayList<>();
tokenId.add(new BigInteger("0"));
tokenId.add(new BigInteger("0"));

List<BigInteger> amounts = erc1155Contract.balanceOfBatch(address, tokenId);

// 调用 isApprovedForAll 函数
Boolean result = erc1155Contract.isApprovedForAll("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", "0x552115849813d334C58f2757037F68E2963C4c5e");
```

写入

```java
// 调用 setApprovalForAll 函数
SendResultModel sendResultModel = erc1155Contract.setApprovalForAll(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 被授权人
                true, // 是否授权全部
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果

// 调用 safeTransferFrom 函数
SendResultModel sendResultModel = erc1155Contract.safeTransferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // 转账付款人
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 转账接收人
                new BigInteger("1002"), // tokenId
                new BigInteger("1"), // 数量
                new byte[0], // data
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果

// 调用 safeBatchTransferFrom 函数
List<BigInteger> tokenIds = new ArrayList<>();
tokenIds.add(new BigInteger("1002"));
tokenIds.add(new BigInteger("1003"));

List<BigInteger> amounts = new ArrayList<>();
amounts.add(new BigInteger("1"));
amounts.add(new BigInteger("10"));

SendResultModel sendResultModel = erc1155Contract.safeBatchTransferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // 转账付款人
                "0x552115849813d334C58f2757037F68E2963C4c5e", // 转账接收人
                tokenIds, // tokenId 集合
                amounts, // 数量 集合
                new byte[0], // data
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // 调用者的地址
                        .setPrivateKey("")// senderAddress的私钥
                        .setValue(new BigInteger("1000000000")) // 主链币数量，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasPrice(new BigInteger("1000")) // gasPrice，如果想用默认值 可以直接传null，或者不传这个参数
                        .setGasLimit(new BigInteger("800000")) // gasLimit，如果想用默认值 可以直接传null，或者不传这个参数
        );
sendResultModel.getEthSendTransaction(); // 发送交易后的结果
sendResultModel.getEthGetTransactionReceipt(); // 交易成功上链后的结果
```

### InputData 编解码

```java
// 编码
String inputData = EthAbiCodecTool.getInputData(
            "transfer", // 方法名
            new Address(toAddress), // 参数1
            new Uint256(new BigInteger("1000000000000000000")) // 参数2，如果还有其他参数，可以继续传入下一个
    );

// 解码
List<Type> result = EthAbiCodecTool.decoderInputData(
            "0x" + inputData.substring(10), // 去除方法签名的inputData
            new TypeReference<Address>() {}, // 被编码的方法的参数1 类型
            new TypeReference<Uint256>() {} // 被编码的方法的参数2 类型， 如果还有其他参数，可以继续传入下一个
    );

for(Type type : result){
    System.out.println(type.getValue());
}

// 获取方法签名，其实就是inputData的前十位
String functionCode = EthAbiCodecTool.getFunAbiCode(
            "transfer", // 方法名
            new Address(toAddress), // 参数1，值随意传，反正我们要的方法签名，不是完整的inputData
            new Uint256(new BigInteger("1000000000000000000")) // 参数2，值随意传，反正我们要的方法签名，不是完整的inputData，如果还有其他参数，可以继续传入下一个
    );
```

### 主链币查询以及转账

```java
String privateKey = ""; // 私钥
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-1-s1.binance.org:8545/")); // 链的RPC地址

EthHelper ethHelper = EthHelper.builder(web3j);

// 余额查询
BigInteger balance = ethHelper.balanceOf(fromAddress);

// 转账
TransactionReceipt transactionReceipt = ethHelper.transfer(
            toAddress,
            privateKey, 
            BigDecimal.valueOf(1),
            Convert.Unit.ETHER
);
```