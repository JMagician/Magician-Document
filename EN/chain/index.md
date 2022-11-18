# Magician-Web3

Magician-web3 is a blockchain development toolkit. It consists of two functions. One is to scan the blockchain and monitor the transactions according to the developer's needs. The other is some secondary packaging of web3j, which can reduce the workload of developers in some common scenarios. It is planned to support three chains, ETH (BSC, POLYGAN, etc.), SOL and TRON

He does not need to rely on Magician and can be used completely independently

## Initial configuration

### Importing dependencies

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Web3</artifactId>
    <version>1.0.2</version>
</dependency>

<!-- This is the logging package, you must have it or the console will not see anything, any logging package that can bridge with slf4j is supported -->
<dependency>
    <groupId>org.slf4j</groupId>
    <artifactId>slf4j-jdk14</artifactId>
    <version>1.7.12</version>
</dependency>
```

## Scan blocks and listen for transaction events

### Create a listener

You can create multiple listeners and set the listening conditions separately according to your needs

#### ETH(BSC, Poygan, etc.) listener
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
                .setFunctionCode("0xasdas123"); // Filtering transactions that call a method in a contract
    }

    /**
     * If a transaction matching the above conditions is encountered, this method will be triggered
     * transactionModel.getEthTransactionModel() is a transaction object that contains all the data such as hash, value, from, to, etc.
     */
    @Override
    public void call(TransactionModel transactionModel) {
        String template = "Scan to Eligible Transactions, hash:{0}, from:{1}, to: {2}, input: {3}";
        template = template.replace("{0}", transactionModel.getEthTransactionModel().getBlockHash());
        template = template.replace("{1}", transactionModel.getEthTransactionModel().getFrom());
        template = template.replace("{2}", transactionModel.getEthTransactionModel().getTo());
        template = template.replace("{3}", transactionModel.getEthTransactionModel().getInput());

        System.out.println(template);
    }
}
```

#### SOL, TRON Chain's Scan Block High feature under development......

```java
Under Development......
```

### Start a task that scans the block height

```java

// Initialize the thread pool, the number of core threads must be >= the number of chains you want to scan, it is recommended to equal the number of chains to be scanned
EventThreadPool.init(1);

// Open a scan task, if you want to scan multiple chains, you can open multiple tasks, 
// by copying the following code and modifying the corresponding configuration you can open a new task
MagicianBlockchainScan.create()
        .setRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/") // RPC address of the node
        .setChainType(ChainType.ETH) // Chain to be scanned (if set to ETH, then any other Ethernet standard chain such as BSC, POLYGAN, etc. can be scanned)
        .setScanPeriod(5000) // Interval of each round of scanning
        .setScanSize(1000) // Number of blocks scanned per round
        .setBeginBlockNumber(BigInteger.valueOf(24318610)) // From which block height to start scanning
        .addEthMonitorEvent(new EventOne()) // Add Listening Events
        .addEthMonitorEvent(new EventTwo()) // Add Listening Events
        .addEthMonitorEvent(new EventThree()) // Add Listening Events
        .start();

// TODO SOL and TRON are not supported for now, under development......
```

### Using a proxy to access RPC addresses

```java
// Use another overload of the setRpcUrl method and just pass in the proxy settings
MagicianBlockchainScan.create()
        .setRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/",
                    new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4780))) 
        .start();

// ---------- In addition to the above, there are several overloads for the setRpcUrl method, so pick the right one according to your needs ----------

// Pass directly into wei3j's HttpService
// This method is the most customizable and is basically the way web3j is supposed to be used
MagicianBlockchainScan.create()
        .setRpcUrl(new HttpService("")) 
        .start();

// Pass in okHttpClient
// This method is also very customizable and basically uses okHttp to access the blockchain node
OkHttpClient okHttpClient = xxxxxx;
MagicianBlockchainScan.create()
        .setRpcUrl(okHttpClient) 
        .start();

// Some proxies require authentication, so you can use this to set the username and password
MagicianBlockchainScan.create()
                    .setRpcUrl("https://data-seed-prebsc-1-s1.binance.org:8545/",
                            new Proxy(Proxy.Type.HTTP, new InetSocketAddress("127.0.0.1", 4780)),
                            (Route route, Response response) -> {

                                // Set the proxy server account password
                                String credential = Credentials.basic("username", "password");
                                return response.request().newBuilder()
                                        .header("Proxy-Authorization", credential)
                                        .build();
                            }
                    )
```

## Web3j Extensions

Several basic methods have been extended on top of Web3j to reduce the workload of developers to a certain extent

### Coin iquiry and Transfer

```java
String privateKey = ""; // Private key
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-1-s1.binance.org:8545/")); // RPC address of the chain

// This approach is a single instance of
EthHelper ethHelper =  MagicianWeb3.getEthBuilder().getEth(web3j, privateKey);
// If you want to create multiple EthHelper objects, you can do so in this way
EthHelper ethHelper = EthHelper.builder(web3j, privateKey);

// Balance Query
BigInteger balance = ethHelper.balanceOf(fromAddress);

// transfer
TransactionReceipt transactionReceipt = ethHelper.transfer(
            toAddress, // Recipient's address
            BigDecimal.valueOf(1), // Sending quantity
            Convert.Unit.ETHER // Units of quantity
);
```

### InputData Codec

```java
// This approach is a single instance of
EthAbiCodec ethAbiCodec = MagicianWeb3.getEthBuilder().getEthAbiCodec();
// If you want to create multiple EthAbiCodec objects, you can do so in this way
EthAbiCodec ethAbiCodec = new EthAbiCodec();

// Encoding
String inputData = ethAbiCodec.getInputData(
            "transfer", // Method name
            new Address(toAddress), // Parameter 1
            new Uint256(new BigInteger("1000000000000000000")) // Parameter 2，If there are other parameters, you can go ahead and pass in the next
    );

// Decoding
List<Type> result = ethAbiCodec.decoderInputData(
            "0x" + inputData.substring(10), // Removing  method signatures from inputData
            new TypeReference<Address>() {}, // The type of the parameter1 of the method being encoded
            new TypeReference<Uint256>() {} // The type of the parameter2 of the method being encoded， If there are other parameters, you can go ahead and pass in the next
    );

for(Type type : result){
    System.out.println(type.getValue());
}

// Get the method signature, which is actually the first ten characters of inputData, containing 0x.
// Here only focus on the type of parameters, the value can be passed freely, because we need only the first ten characters, not the full inputData
String functionCode = ethAbiCodec.getFunAbiCode(
            "transfer", // Method name
            new Address(toAddress), // Parameter 1
            new Uint256(new BigInteger("1000000000000000000")) // Parameter 2，If there are other parameters, you can go ahead and pass in the next
    );
```

### Contract Query and Write

```java
String privateKey = ""; // Private key
Web3j web3j = Web3j.build(new HttpService("https://data-seed-prebsc-1-s1.binance.org:8545/")); // RPC address of the chain

// This approach is a single instance of
EthContract ethContract = MagicianWeb3.getEthBuilder().getEthContract(web3j, fromAddressPrivateKey);
// If you want to create multiple EthContract objects, you can do so in this way
EthContract ethContract = EthContract.builder(web3j, privateKey);


EthAbiCodec ethAbiCodec = MagicianWeb3.getEthBuilder().getEthAbiCodec();

// Query
List<Type> result = ethContract.select(
            contractAddress, // Contract Address
            ethAbiCodec.getInputData(
                    "balanceOf", // Name of the method to be called
                    new Address(toAddress) // method, if there are multiple parameters, you can continue to pass the next parameter
            ),  // The inputData of the method to be called
            new TypeReference<Uint256>() {} // The return type of the method, if there is more than one return value, you can continue to pass the next parameter
        );

// Write data to the contract
// gasPrice, gasLimit two parameters, if you want to use the default value can not pass, or pass null
// If not, don't pass both parameters, if you want to pass them, pass them together, if set to null, one can be null and one can have a value
SendResultModel sendResultModel = ethContract.sendRawTransaction(
                    fromAddress, // Address of the caller
                    contractAddress, // Contract Address
                    new BigInteger("1200000"), // gasPrice，If you want to use the default value, you can pass null directly or leave this parameter out.
                    new BigInteger("800000"), // gasLimit，If you want to use the default value, you can pass null directly or leave this parameter out.
                    ethAbiCodec.getInputData(
                            "transfer", // Name of the method to be called
                            new Address(toAddress), // Parameter 1
                            new Uint256(new BigInteger("1000000000000000000")) // Parameter 2，If there are other parameters, you can go ahead and pass in the next
                    ) // The inputData of the method to be called
            );

sendResultModel.getEthSendTransaction(); // Results after sending a transaction
sendResultModel.getEthGetTransactionReceipt(); // Results after the transaction is broadcast
```

## The project has several built-in functionCode

If you need to listen to these functions, then you can use them directly, as long as the functions in your contract have the same specification as Openzeppelin, and even the order of the parameter list must be the same

### ERC20

```java
ERC20.TRANSFER.getFunctionCode();
ERC20.APPROVE.getFunctionCode();
ERC20.TRANSFER_FROM.getFunctionCode();
```

### ERC721

```java
ERC721.SAFE_TRANSFER_FROM.getFunctionCode();
ERC721.SAFE_TRANSFER_FROM_TWO.getFunctionCode(); // The one without the data parameter
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