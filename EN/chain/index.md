# Magician-Blockchain

## Magician-Scanning

Magician-Scanning is a toolkit for scanning blockchains developed in Java, which can come in handy when we need some functionality in our programs, for example.

- When an address receives ETH, a method in the program is automatically triggered and this transaction is passed into the method.

- When a function of a contract is called (like ERC20 transfer), it automatically triggers a method in the program and passes this transaction to this method. It can even be triggered only when tokens are transferred to a specified address.

- This toolkit can also be used when a program needs to keep a record of all transactions since the beginning of a block height.

It is planned to support three chains, ETH (BSC, POLYGON, etc.), SOL and TRON

### Importing dependencies

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Scanning</artifactId>
    <version>1.0.12</version>
</dependency>

<!-- This is the logging package, you must have it or the console will not see anything, any logging package that can bridge with slf4j is supported -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.12</version>
</dependency>
```

### ETH(BSC, Polygan, Arb etc.)

#### Create a listener

You can create multiple listeners and set the listening conditions separately according to your needs

```java
/**
 * Create a class that implements the EthMonitorEvent interface and that's it!
 */
public class EventDemo implements EthMonitorEvent {

    /**
     * Filter conditions, if you encounter a transaction that matches the conditions, the call method will be triggered automatically
     * These conditions are all and relations, must be satisfied at the same time to work
     * If you don't want to filter by a condition, just don't set a value for that condition.
     * If this method is not implemented, or returns null, then it means listening to any transaction
     */
    @Override
    public EthMonitorFilter ethMonitorFilter() {
        return EthMonitorFilter.builder()
                .setFromAddress("0x131231249813d334C58f2757037F68E2963C4crc") // Filtering transactions sent by fromAddress
                .setToAddress("0x552115849813d334C58f2757037F68E2963C4c5e") // Filter toAddress or Contract Address Received Delivery易
                .setMinValue(BigInteger.valueOf(1)) // Filter the transactions with the number of sent coins >= minValue
                .setMaxValue(BigInteger.valueOf(10)) // Filter transactions with the number of sent coins <= maxValue
                .setInputDataFilter( // Filter by inputData
                        InputDataFilter.builder()
                                .setFunctionCode(ERC20.TRANSFER.getFunctionCode()) // function signature (a method within the contract being called), supports arbitrary functions, the enumeration here is just a part of the standard contract functions
                                .setTypeReferences( // List of parameters for this function (type only)
                                        new TypeReference<Address>(){},
                                        new TypeReference<Uint256>(){}
                                )
                                .setValue("0x552115849813d334C58f2757037F68E2963C4c5e", null)// Filter by the value of the parameter
                );
    }

    /**
     * If a transaction matching the above conditions is encountered, this method will be triggered
     * transactionModel.getEthTransactionModel() is a transaction object that contains all the data such as hash, value, from, to, etc.
     */
    @Override
    public void call(TransactionModel transactionModel) {
        // Filtered out a transaction record
        EthBlock.TransactionObject transactionObject = transactionModel.getEthTransactionModel().getTransactionObject();

        // Information about the block where this transaction record is located
        EthBlock ethBlock = transactionModel.getEthTransactionModel().getEthBlock();
    }
}
```

#### Input Data Filters Explained

If you want to trigger the monitor when a function in a contract is called

```java
public EthMonitorFilter ethMonitorFilter() {
        return EthMonitorFilter.builder()
                .setToAddress("0x552115849813d334C58f2757037F68E2963C4c5e") // Contract Address
                .setInputDataFilter( // Filter by input data
                        InputDataFilter.builder()
                                .setFunctionCode("0xadasasdf") // Called function code (first ten bits of inputData)
                );
}
```

If there is a contract [0x552115849813d334C58f2757037F68E2963C4c5e], with a function transferFrom(address from, address to, uint256 amount)

You want to implement a monitor: if someone uses this function in this contract to transfer tokens to [0x552115849813d334C58f2757037F68E2963C4c5e], it will trigger the Monitor event, then you can write it like this

```java
public EthMonitorFilter ethMonitorFilter() {
        return EthMonitorFilter.builder()
                .setToAddress("0x552115849813d334C58f2757037F68E2963C4c5e") // Contract Address
                .setInputDataFilter( // Filter by input data
                        InputDataFilter.builder()
                                .setFunctionCode(ERC20.TRANSFER_FROM.getFunctionCode()) // Called function code (first ten bits of inputData)
                                .setTypeReferences( // List of parameters for this function (type only)
                                        new TypeReference<Address>(){}, // Type of the first parameter
                                        new TypeReference<Address>(){}, // Type of the second parameter
                                        new TypeReference<Uint256>(){} // Type of the third parameter
                                )
                                .setValue(null, "0x552115849813d334C58f2757037F68E2963C4c5e", null)// filter the second parameter (to) = 0x552115849813d334C58f2757037F68E2963C4c5e
                );
}
```

#### Start a task that scans the block height

```java

// To initialize the thread pool, the number of core threads must >= the global number of tasks to sweep the block + the global number of retry policies
// This is a global configuration, no matter how many tasks you open, no matter how many chains you need to scan, how many chains, you only need to write this code once
EventThreadPool.init(1);

// Open a scan task, if you want to scan multiple chains, you can open multiple tasks, 
// by copying the following code and modifying the corresponding configuration you can open a new task
MagicianBlockchainScan.create()
        .setRpcUrl(
                EthRpcInit.create()
                        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545")
        ) // RPC address of the node
        .setScanPeriod(5000) // Interval of each round of scanning
        .setBeginBlockNumber(BigInteger.valueOf(24318610)) // From which block height to start scanning
        .setEndBlockNumber(BigInteger.valueOf(24318680)) // Stop this task when it reaches this block height(Not set or set to 0 for unrestricted)
        .addEthMonitorEvent(new EventOne()) // Add Listening Events
        .addEthMonitorEvent(new EventTwo()) // Add Listening Events
        .addEthMonitorEvent(new EventThree()) // Add Listening Events
        .start();
```

#### Using a proxy to access RPC addresses

```java
// Use another overload of the setRpcUrl method and just pass in the proxy settings
EthRpcInit.create()
        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/",
                    new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4780)))

// ---------- In addition to the above, there are several overloads for the setRpcUrl method, so pick the right one according to your needs ----------

// Pass directly into wei3j's HttpService
// This method is the most customizable and is basically the way web3j is supposed to be used
EthRpcInit.create()
        .addRpcUrl(new HttpService(""))

// Pass in okHttpClient
// This method is also very customizable and basically uses okHttp to access the blockchain node
OkHttpClient okHttpClient = xxxxxx;
EthRpcInit.create()
        .addRpcUrl(okHttpClient)

// Some proxies require authentication, so you can use this to set the username and password
EthRpcInit.create()
        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/",
                new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4780)),
                (Route route, Response response) -> {

                String credential = Credentials.basic("userName", "password");
                return response.request().newBuilder()
                        .header("Proxy-Authorization", credential)
                        .build();
                }
        )
```

### TRON

#### Create a listener

Conditional filter is still under development, you can pay attention to the subsequent updates, call method will receive all the scanned transaction information, you need to judge the filter yourself

```java
/**
 * Just create a class that implements the TronMonitorEvent interface
 */
public class TronEventOne implements TronMonitorEvent {

        /**
         * The transactionModel object contains all the information about this transaction
         */
        @Override
        public void call(TransactionModel transactionModel) {
                System.out.println("TRON 成功了！！！");
                System.out.println("TRON, txID: " + transactionModel.getTronTransactionModel().getTxID());
        }

}
```

#### Start a task that scans the block height

Two differences from the ETH scan task are marked below, other than that there are no other differences

```java
// To initialize the thread pool, the number of core threads must >= the global number of tasks to sweep the block + the global number of retry policies
// This is a global configuration, no matter how many tasks you open, no matter how many chains you need to scan, how many chains, you only need to write this code once
EventThreadPool.init(1);

MagicianBlockchainScan.create()
        .setRpcUrl(
                // [The difference with ETH 1], here you need to use TronRpcInit
                TronRpcInit.create()
                        .addRpcUrl("https://api.shasta.trongrid.io/wallet")
        )
        .addTronMonitorEvent(new TronEventOne()) // [The difference with ETH 2], You need to add a listener with the addTronMonitorEvent method
        .start();
```

#### Using a proxy to access RPC addresses

```java
Under Development......
```

### SOLANA

```java
Under Development......
```

### Stop a particular scan job

All three chains are written in the same way

```java
// Get the object to the
MagicianBlockchainScan blockChainScan = MagicianBlockchainScan.create()
        .setRpcUrl(
                EthRpcInit.create()
                        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545")
        ) // RPC address of the node
        .setScanPeriod(5000) // Interval of each round of scanning
        .setBeginBlockNumber(BigInteger.valueOf(24318610)) // From which block height to start scanning
        .addEthMonitorEvent(new EventOne()) // Add Listening Events

// Because the start method has no return value, the above chain cannot call start, but needs to be called with the returned object instead
blockChainScan.start();

// Call this method to stop this one scan task
blockChainScan.shutdown();
```

### Stop all scanning jobs

```java
MagicianBlockchainScan.shutdownAll();
```

### Get the maximum block height that has been scanned

```java
// Get the object to the
MagicianBlockchainScan blockChainScan = MagicianBlockchainScan.create()
        .setRpcUrl(
                EthRpcInit.create()
                        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545")
        ) // RPC address of the node
        .setScanPeriod(5000) // Interval of each round of scanning
        .setBeginBlockNumber(BigInteger.valueOf(24318610)) // From which block height to start scanning
        .addEthMonitorEvent(new EventOne()) // Add Listening Events

// Because the start method has no return value, the above chain cannot call start, but needs to be called with the returned object instead
blockChainScan.start();

// Call this method to get the maximum block height that has been scanned by the current task
// There is some differences, because at the moment you get it, the scanning task may have scanned several new blocks
blockChainScan.getCurrentBlockHeight();
```

### Configuring multiple RPC URLs to achieve load balancing

All three chains are the same, except that EthRpcInit needs to be changed to the class of the corresponding chain

Call the addRpcUrl method several times and pass in multiple RPC URLs to achieve load balancing (polling)

```java
MagicianBlockchainScan.create()
        .setRpcUrl(
                EthRpcInit.create()
                        .addRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545")
                        .addRpcUrl("https://data-seed-prebsc-2-s1.binance.org:8545")
                        .addRpcUrl("https://data-seed-prebsc-1-s2.binance.org:8545")
        )
```

### Retry Strategy

All three chains are written in the same way

Retries will occur when the following two conditions are met, both of which must be met
1. the block height currently being scanned is empty (the block does not exist or there are no transactions in the block)
2. The current block height being scanned is < the latest block height on the chain

When the above two conditions are met, the scan task will skip the block and continue scanning the next block, and the retry strategy will receive the skipped block height.
You can handle this yourself in the retry strategy

#### Create a retry strategy
```java
public class EthRetry implements RetryStrategy {

    @Override
    public void retry(BigInteger blockNumber) {
        
    }
}
```

#### Add a retry strategy to the scan task
```java
MagicianBlockchainScan.create()
                .setRetryStrategy(new EthRetry())// Call this method to add
                .start();
```

#### needs to pay attention to the configuration of the number of threads

If you have a scan task + a retry strategy, then two threads are needed, so the parameter must be 2

```java
// To initialize the thread pool, the number of core threads must >= the global number of tasks to sweep the block + the global number of retry policies
// This is a global configuration, no matter how many tasks you open, no matter how many chains you need to scan, how many chains, you only need to write this code once
EventThreadPool.init(2);
```

### InputData Codec

#### ETH(BSC, Poygan, etc.)

```java
// Encoding
String inputData = EthAbiCodec.getInputData(
            "transfer", // Method name
            new Address(toAddress), // Parameter 1
            new Uint256(new BigInteger("1000000000000000000")) // Parameter 2，If there are other parameters, you can go ahead and pass in the next
    );

// Decoding
List<Type> result = EthAbiCodec.decoderInputData(
            "0x" + inputData.substring(10), // Removing  method signatures from inputData
            new TypeReference<Address>() {}, // The type of the parameter1 of the method being encoded
            new TypeReference<Uint256>() {} // The type of the parameter2 of the method being encoded， If there are other parameters, you can go ahead and pass in the next
    );

for(Type type : result){
    System.out.println(type.getValue());
}

// Get the method signature, which is actually the first ten characters of inputData, containing 0x.
// Here only focus on the type of parameters, the value can be passed freely, because we need only the first ten characters, not the full inputData
String functionCode = EthAbiCodec.getFunAbiCode(
            "transfer", // Method name
            new Address(toAddress), // Parameter 1
            new Uint256(new BigInteger("1000000000000000000")) // Parameter 2，If there are other parameters, you can go ahead and pass in the next
    );
```

#### TRON

```java
Under Development......
```

#### SOLANA

```java
Under Development......
```

### The project has several built-in functionCode(ETH, BSC, Poygan, etc.)

If you need to listen to these functions, then you can use them directly, as long as the functions in your contract have the same specification as Openzeppelin, and even the order of the parameter list must be the same

#### ERC20

```java
ERC20.TRANSFER.getFunctionCode();
ERC20.APPROVE.getFunctionCode();
ERC20.TRANSFER_FROM.getFunctionCode();
```

#### ERC721

```java
ERC721.SAFE_TRANSFER_FROM.getFunctionCode();
ERC721.SAFE_TRANSFER_FROM_TWO.getFunctionCode(); // The one without the data parameter
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

Magician-ContractsTools is a toolkit for calling smart contracts , you can very easily call smart contracts in Java programs for query and write operations.

There are three built-in standard contract templates, ERC20, ERC721, and ERC1155, which can help you get things done very quickly if you need to call the standard functions in these three contracts. In addition to the built-in contract templates, it is also easy to call custom contract functions if you need to do so, and we will continue to add standard templates later.

In addition, there are tools for InputData decoding and ETH query and transfer

It is planned to support three chains, ETH (BSC, POLYGON, etc.), SOL and TRON

### Importing dependencies

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-ContractsTools</artifactId>
    <version>1.0.4</version>
</dependency>

<!-- This is the logging package, you must have it or the console will not see anything, any logging package that can bridge with slf4j is supported -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.12</version>
</dependency>
```

### Contract Query and Write

Initialize the contract util class

```java
String privateKey = ""; // Private key
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-1-s1.binance.org:8545/")); // RPC address of the chain

String contractAddress = "";

EthContractUtil ethContractUtil = EthContractUtil.builder(web3j);
```

Read contract

```java
List<Type> result = ethContractUtil.select(
            contractAddress, // Contract Address
            EthAbiCodecTool.getInputData(
                    "balanceOf", // Name of the method to be called
                    new Address(toAddress) // method, if there are multiple parameters, you can continue to pass the next parameter
            ),  // The inputData of the method to be called
            new TypeReference<Uint256>() {} // The return type of the method, if there is more than one return value, you can continue to pass the next parameter
        );
```

Write contract

```java
SendResultModel sendResultModel = ethContractUtil.sendRawTransaction(
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setToAddress(contractAddress) // Contract Address
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setNonce(new BigInteger("100")), // nonce，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setChainId(97)
                EthAbiCodecTool.getInputData(
                        "transfer", // Name of the method to be called
                        new Address(toAddress), // Parameter 1
                        new Uint256(new BigInteger("1000000000000000000")) // Parameter 2，If there are other parameters, you can go ahead and pass in the next
                ) // The inputData of the method to be called
        );

sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast
```

### Contract Templates

Currently there are only three templates, and they will continue to be added later

#### Calling ERC20 Contracts

Initialization Contract Template

```java
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-2-s1.binance.org:8545"));

String contractAddress = "";

ERC20Contract erc20Contract = ERC20Contract.builder(web3j, contractAddress);
```

Read

```java
// Call the totalSupply function of the contract
BigInteger total = erc20Contract.totalSupply();

// Call the balanceOf function of the contract
BigInteger amount = erc20Contract.balanceOf("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84");

// Call the allowance function of the contract
BigInteger amount = erc20Contract.allowance("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", "0x552115849813d334C58f2757037F68E2963C4c5e");
```

Write

```java
// Call the transfer function of the contract
SendResultModel sendResultModel = erc20Contract.transfer(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // Transfer recipient
                new BigInteger("1000000000000000000"), // Transfer Amount
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast

// Call the transferFrom function of the contract
SendResultModel sendResultModel = erc20Contract.transferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // Transfer payer
                "0x552115849813d334C58f2757037F68E2963C4c5e", // Transfer recipient
                new BigInteger("1000000000000000000"), // Transfer Amount
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast

// Call the approve function of the contract
SendResultModel sendResultModel = erc20Contract.approve(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // spender
                new BigInteger("1000000000000000000"), // Amount
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast
```

#### Calling the ERC721 contract

Initialization Contract Template

```java
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-2-s1.binance.org:8545"));

String contractAddress = "";

ERC721Contract erc721Contract = ERC721Contract.builder(web3j, contractAddress);
```

Read

```java
// Call the balanceOf function of the contract
BigInteger amount = erc20Contract.balanceOf("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84");

// Call the ownerOf function of the contract
String ownerAddress = erc721Contract.ownerOf(new BigInteger("1002"));

// Call the isApprovedForAll function of the contract
Boolean result = erc1155Contract.isApprovedForAll("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", "0x552115849813d334C58f2757037F68E2963C4c5e");

// Call the getApproved function of the contract
String approvedAddress = erc721Contract.getApproved(new BigInteger("1002"));
```

Write

```java
// Call the approve function of the contract
SendResultModel sendResultModel = erc721Contract.approve(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // spender
                new BigInteger("1002"), // tokenId
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast

// Call the transferFrom function of the contract
SendResultModel sendResultModel = erc20Contract.transferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // Transfer payer
                "0x552115849813d334C58f2757037F68E2963C4c5e", // Transfer recipient
                new BigInteger("1002"), // tokenId
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast

// Call the safeTransferFrom function of the contract(The one without the data parameter)
SendResultModel sendResultModel = erc20Contract.safeTransferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // Transfer payer
                "0x552115849813d334C58f2757037F68E2963C4c5e", // Transfer recipient
                new BigInteger("1002"), // tokenId
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast

// Call the safeTransferFrom function of the contract
SendResultModel sendResultModel = erc20Contract.safeTransferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // Transfer payer
                "0x552115849813d334C58f2757037F68E2963C4c5e", // Transfer recipient
                new BigInteger("1002"), // tokenId
                new byte[0], // data
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast

// Call the setApprovalForAll function of the contract
SendResultModel sendResultModel = erc1155Contract.setApprovalForAll(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // spender
                true, // Whether to approval all
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast
```

#### Calling the ERC1155 contract


Initialization Contract Template

```java
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-2-s1.binance.org:8545"));

String contractAddress = "";

ERC1155Contract erc1155Contract = ERC1155Contract.builder(web3j, contractAddress);
```

Read

```java

// Call the balanceOf function of the contract
BigInteger amount = erc1155Contract.balanceOf("0x552115849813d334C58f2757037F68E2963C4c5e", new BigInteger("0"));

// Call the balanceOfBatch function of the contract
List<String> address = new ArrayList<>();
address.add("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84");
address.add("0x552115849813d334C58f2757037F68E2963C4c5e");

List<BigInteger> tokenId = new ArrayList<>();
tokenId.add(new BigInteger("0"));
tokenId.add(new BigInteger("0"));

List<BigInteger> amounts = erc1155Contract.balanceOfBatch(address, tokenId);

// Call the isApprovedForAll function of the contract
Boolean result = erc1155Contract.isApprovedForAll("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", "0x552115849813d334C58f2757037F68E2963C4c5e");
```

Write

```java
// Call the setApprovalForAll function of the contract
SendResultModel sendResultModel = erc1155Contract.setApprovalForAll(
                "0x552115849813d334C58f2757037F68E2963C4c5e", // spender
                true, // Whether to approval all
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast

// Call the safeTransferFrom function of the contract
SendResultModel sendResultModel = erc1155Contract.safeTransferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // Transfer payer
                "0x552115849813d334C58f2757037F68E2963C4c5e", // Transfer recipient
                new BigInteger("1002"), // tokenId
                new BigInteger("1"), // 数量
                new byte[0], // data
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast

// Call the safeBatchTransferFrom function of the contract
List<BigInteger> tokenIds = new ArrayList<>();
tokenIds.add(new BigInteger("1002"));
tokenIds.add(new BigInteger("1003"));

List<BigInteger> amounts = new ArrayList<>();
amounts.add(new BigInteger("1"));
amounts.add(new BigInteger("10"));

SendResultModel sendResultModel = erc1155Contract.safeBatchTransferFrom(
                "0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84", // Transfer payer
                "0x552115849813d334C58f2757037F68E2963C4c5e", // Transfer recipient
                tokenIds, // tokenId collection
                amounts, // amount collection
                new byte[0], // data
                SendModel.builder()
                        .setSenderAddress("0xb4e32492E9725c3215F1662Cf28Db1862ed1EE84") // Address of the caller
                        .setPrivateKey("")// Private key of senderAddress
                        .setValue(new BigInteger("1000000000")) // coin amount, If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasPrice(new BigInteger("1000")) // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                        .setGasLimit(new BigInteger("800000")) // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
        );
sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast
```

### InputData Codec

```java
// Encoding
String inputData = EthAbiCodecTool.getInputData(
            "transfer", // Method name
            new Address(toAddress), // Parameter 1
            new Uint256(new BigInteger("1000000000000000000")) // Parameter 2，If there are other parameters, you can go ahead and pass in the next
    );

// Decoding
List<Type> result = EthAbiCodecTool.decoderInputData(
            "0x" + inputData.substring(10), // Removing  method signatures from inputData
            new TypeReference<Address>() {}, // The type of the parameter1 of the method being encoded
            new TypeReference<Uint256>() {} // The type of the parameter2 of the method being encoded， If there are other parameters, you can go ahead and pass in the next
    );

for(Type type : result){
    System.out.println(type.getValue());
}

// Get the method signature, which is actually the first ten characters of inputData, containing 0x.
// Here only focus on the type of parameters, the value can be passed freely, because we need only the first ten characters, not the full inputData
String functionCode = EthAbiCodecTool.getFunAbiCode(
            "transfer", // Method name
            new Address(toAddress), // Parameter 1
            new Uint256(new BigInteger("1000000000000000000")) // Parameter 2，If there are other parameters, you can go ahead and pass in the next
    );
```

### Coin Query and Transfer

```java
String privateKey = ""; // Private key
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-1-s1.binance.org:8545/")); // RPC address of the chain

EthHelper ethHelper = EthHelper.builder(web3j);

// Balance Query
BigInteger balance = ethHelper.balanceOf(fromAddress);

// transfer
TransactionReceipt transactionReceipt = ethHelper.transfer(
            toAddress, // Recipient's address
            privateKey, 
            BigDecimal.valueOf(1), // Sending quantity
            Convert.Unit.ETHER // Units of quantity
);
```