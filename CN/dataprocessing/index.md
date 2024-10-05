# Magician-DataProcessing

Magician-DataProcessing 是一个用Java开发的数据处理框架，支持并发处理以及生产者与消费者模型

## 初始化配置

### 导入依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-DataProcessing</artifactId>
    <version>1.0.0</version>
</dependency>
```

## 并发处理任务

```java
MagicianDataProcessing.getConcurrentTaskSync()
                .setTimeout(1000) // 超时时间
                .setTimeUnit(TimeUnit.MILLISECONDS) // 超时时间的单位
                .add(() -> { // 添加一个任务

                    // 在这里可以写上任务的业务逻辑

                }, (result, e) -> {
                    // 此任务处理后的回调
                    if(result.equals(ConcurrentTaskResultEnum.FAIL)){
                        // 任务失败，此时e里面有详细的异常信息
                    } else if(result.equals(ConcurrentTaskResultEnum.SUCCESS)) {
                        // 任务成功，此时e是空的
                    }
                })
                .add(() -> { // 添加一个任务

                    // 在这里可以写上任务的业务逻辑

                }, (result, e) -> {
                    // 此任务处理后的回调
                    if(result.equals(ConcurrentTaskResultEnum.FAIL)){
                        // 任务失败，此时e里面有详细的异常信息
                    } else if(result.equals(ConcurrentTaskResultEnum.SUCCESS)) {
                        // 任务成功，此时e是空的
                    }
                })
                .start();
```

添加进去的任务会并发执行，但是在它们执行完之前，这整个代码块会同步等待在这，一直等到所有任务执行完或者超时才会继续往下走。

这里面的超时时间就是用来设置同步等待多久的。

- 如果设置为0表示一直等到所有任务完成为止
- 设置为大于0的时候，表示只等待这么久



## 并发处理List，Set等所有Collection类的集合里的元素

### 同步执行

假如有一个List需要并发处理里面的元素

```java
List<String> dataList = new ArrayList<>();
```

只需要将他传入syncRunner方法即可

```java
MagicianDataProcessing.getConcurrentCollectionSync()
        .syncRunner(dataList, data -> {

            // 这里可以拿到List里的元素，进行处理
            // List里的元素是什么类型，这个data就是什么类型
            System.out.println(data);
        
        }, 
        10, // 每组多少条元素
        1, // 每组之间同步等待多久
        TimeUnit.MINUTES // 等待的时间单位
        );
```

这个方法会将传进去的集合分成若干组，每组的大小由参数指定。

这些组会排队执行，但是每一组在执行的时候都是并发的，里面的每一个元素都会由单独的线程去处理。

需要等一组处理完了，才会处理下一组，但是有时候我们不想这么死板的等待，所以可以设置一个超时时间，超过了这个期限就不等了，直接进行下一组，所以这里的最后两个参数就是用来设置这个期限的。

#### 也可以让每一组单独占一个线程

```java
// 也可以用syncGroupRunner方法
MagicianDataProcessing.getConcurrentCollectionSync()
        .syncGroupRunner(dataList, data -> {

            // 这里是每一组List
            for(String item : data){
                // 这里可以拿到List里的元素，进行处理
                System.out.println(data);
            }
        
        }, 
        10, // 每组多少条元素
        1, // 每组之间同步等待多久
        TimeUnit.MINUTES // 等待的时间单位
        );
```

这个方法会将传进去的集合分成若干组，每组的大小由参数指定。

每一组由单独的线程处理。

会一直同步等待在这里，直到所有组都处理完了才会进行下一步，但是有时候我们不想这么死板的等待，所以可以设置一个超时时间，超过了这个期限就不等了，直接执行下一步。所以这里的最后两个参数就是用来设置这个期限的。

### 异步执行

其实就是将上面【同步处理】的代码放到了一个线程里，内部处理依然是上面【同步处理】的逻辑，但是这整个代码块将会异步执行，不需要等在这。所以个别相同的参数就不再重复解释了。

注：异步执行，必须手动关闭线程池。

```java
// 假如有一个List需要并发处理里面的元素
List<String> dataList = new ArrayList<>();
```

#### 每个元素并发执行

```java
// 只需要将他传入asyncRunner方法即可
MagicianDataProcessing.ConcurrentCollectionAsync(
                1, // 核心线程数
                1, // 最大线程数
                1, // 线程空闲时间
                TimeUnit.MINUTES // 空闲时间单位
                .asyncRunner(dataList, data -> {

            // 这里可以拿到List里的元素，进行处理
            System.out.println(data);
    
        }, 
        10, // 每组多少条元素
        1, // 每组之间同步等待多久
        TimeUnit.MINUTES // 等待的时间单位
        );
```

ConcurrentCollectionAsync里的参数其实就是线程池的参数，除了上面这种写法，还可以这样写。

每调用一次asyncRunner都会占用一个线程，而这些线程都是由一个线程池在管理。

```java
ConcurrentCollectionAsync concurrentCollectionAsync = MagicianDataProcessing.ConcurrentCollectionAsync(
                1, // 核心线程数
                1, // 最大线程数
                1, // 线程空闲时间
                TimeUnit.MINUTES // 空闲时间单位
                );

concurrentCollectionAsync.asyncRunner(dataList, data -> {

            // 这里是每一组List
            for(String item : data){
                // 这里可以拿到List里的元素，进行处理
                System.out.println(data);
            }
    
        }, 
        10, // 每组多少条元素
        1, // 每组之间同步等待多久
        TimeUnit.MINUTES // 等待的时间单位
        );

concurrentCollectionAsync.asyncRunner(dataList2, data -> {

            // 这里可以拿到List里的元素，进行处理
            System.out.println(data);
    
        }, 
        10, // 每组多少条元素
        1, // 每组之间同步等待多久
        TimeUnit.MINUTES // 等待的时间单位
        );

concurrentCollectionAsync.asyncRunner(dataList3, data -> {

            // 这里可以拿到List里的元素，进行处理
            System.out.println(data);
    
        }, 
        10, // 每组多少条元素
        1, // 每组之间同步等待多久
        TimeUnit.MINUTES // 等待的时间单位
        );
```

用这个方法可以管理线程池

```java
// 关闭线程池
concurrentCollectionAsync.shutdown();

// 立刻关闭线程池
concurrentCollectionAsync.shutdownNow();

// 获取线程池
ThreadPoolExecutor threadPoolExecutor = concurrentCollectionAsync.getPoolExecutor();
```

#### 每一组并发执行

```java
// 也可以用asyncGroupRunner方法，每个参数的具体含义可以参考文档
MagicianDataProcessing.ConcurrentCollectionAsync(
                1, // 核心线程数
                1, // 最大线程数
                1, // 线程空闲时间
                TimeUnit.MINUTES // 空闲时间单位
                .asyncGroupRunner(dataList, data -> {
        
            // 这里是每一组List
            for(String item : data){
                // 这里可以拿到List里的元素，进行处理
                System.out.println(data);
            }
        
        }, 
        10, // 每组多少条元素
        1, // 每组之间同步等待多久
        TimeUnit.MINUTES // 等待的时间单位
```

同上

## 并发处理所有Map类的集合里的元素

Map的逻辑跟Collection一模一样，只不过是传入的集合变成了Map，就不再累述了，感谢理解。

### 同步执行

#### 每个元素并发执行

```java
// 假如有一个Map需要并发处理里面的元素
Map<String, Object> dataMap = new HashMap<>();

// 只需要将他传入syncRunner方法即可
MagicianDataProcessing.getConcurrentMapSync()
        .syncRunner(dataMap, (key, value) -> {

            // 这里可以拿到Map里的元素，进行处理
            System.out.println(key);
            System.out.println(value);
        
        }, 10, 1, TimeUnit.MINUTES);
```

#### 每一组并发执行

```java
// 也可以用syncGroupRunner方法
MagicianDataProcessing.getConcurrentMapSync()
        .syncGroupRunner(dataMap, data -> {

            // 这里是每一组Map
            for(Map.Entry<String, Object> entry : data.entrySet()){
                // 这里可以拿到Map里的每一个元素
                System.out.println(entry.getKey());
                System.out.println(entry.getValue());
            }
        
        }, 10, 1, TimeUnit.MINUTES);
```

### 异步执行

异步执行，必须手动关闭线程池。

#### 每个元素并发执行

```java
// 假如有一个Map需要并发处理里面的元素
Map<String, Object> dataMap = new HashMap<>();

// 只需要将他传入asyncRunner方法即可
MagicianDataProcessing.getConcurrentMapAsync(
                1,
                1,
                1,
                TimeUnit.MINUTES
                ).asyncRunner(dataMap, (key, value) -> {

            // 这里可以拿到Map里的元素，进行处理
            System.out.println(key);
            System.out.println(value);
    
        }, 10, 1, TimeUnit.MINUTES);
```

#### 每一组并发执行

```java
// 也可以用asyncGroupRunner方法
MagicianDataProcessing.getConcurrentMapAsync(
                1,
                1,
                1,
                TimeUnit.MINUTES
                ).asyncGroupRunner(dataMap, data -> {
        
            // 这里是每一组Map
            for(Map.Entry<String, Object> entry : data.entrySet()){
                // 这里可以拿到Map里的每一个元素
                System.out.println(entry.getKey());
                System.out.println(entry.getValue());
            }
        
        }, 10, 1, TimeUnit.MINUTES);
```

## 生产者与消费者

这是一个多对多的模型，多个生产者可以给多个消费者推送不同类型的数据，

### 我们先创建一个生产者
```java
public class DemoProducer extends MagicianProducer {

    /**
     * 设置ID，必须全局唯一，默认是当前类的全名
     * 如果采用默认值，可以不重写这个方法
     * @return
     */
    @Override
    public String getId() {
        return super.getId();
    }

    /**
     * 设置producer方法是否重复执行，默认重复
     * 如果采用默认值，可以不重写这个方法
     * @return
     */
    @Override
    public boolean getLoop() {
        return super.getLoop();
    }

    /**
     * 设置 是否等消费者全部空闲了才继续生产下一轮数据，默认false
     * 如果采用默认值，可以不重写这个方法
     * @return
     */
    @Override
    public boolean getAllFree() {
        return super.getAllFree();
    }

    /**
     * 当生产者启动后，会自动执行这个方法，我们可以在这个方法里生产数据，并通过publish方法发布给消费者
     *
     * 这边举一个例子
     * 假如我们需要不断地扫描某张表，根据里面的数据状态去执行一些业务逻辑
     * 那么我们可以在这个方法里写一个查询的逻辑，然后将查询到数据发送给消费者
     */
    @Override
    public void producer() {
        // 根据上面的例子，我们可以查询这张表里符合条件的数据
        List<Object> dataList = selectList();

        // 然后将他推送给消费者
        // 可以推送任意类型的数据
        this.publish(dataList);

        /*
          * 如果你只需要执行一次，那么到此就结束了，这个生产者也可以被回收掉了
          *
          * 但是如果你需要不断地执行上述操作，来维护这张表里的数据，这个时候你有两种做法
          * 第一种：加一个while循环
          *      但是这种方式有个问题，如果消费者的消费速度跟不上，那么就很容易造成消费者队列积压，出现内存问题。
          *      而数据积压太久又会影响时效性，可能你推送给消费者的时候，这条数据需要处理，但是等到被消费的时候又不需要处理了，这样容易出现数据错乱的问题。
          *
          * 第二种：等消费者把你推给他的数据消费完了，再推送下一轮，而我们就是采用的这种
          *      如果你想用这种方式，那么你不需要再写其他的任何逻辑，只需要将上面提到的getLoop方法重写一下，并返回true即可
          *      当你设置为true以后，生产者在推送完一轮后会不断地监视消费者，当发现了空闲的消费者才会生产和推送下一轮数据，并且数据只会推送给这几个空闲的消费者
          *
          * 如果你想等所有消费者都空闲了以后再推送下一轮，而不是发现一个空闲的就推送一轮
          * 那么你可以重写上面提到的getAllFree方法，返回true即可
          */

    }
}
```

### 再创建一个消费者
```java
public class DemoConsumer extends MagicianConsumer {
    /**
     * 设置ID，必须全局唯一，默认是当前类的全名
     * 如果采用默认值，可以不重写这个方法
     * @return
     */
    @Override
    public String getId() {
        return super.getId();
    }

    /**
     * 心跳通知，消费者每消费一个任务，都会触发一下这个方法
     * 我们可以根据他触发的频率来判断这个消费者的活跃度
     *
     * 注意！！！
     * 这个方法里不可以有耗时的操作，不然会将消费者阻塞的
     * 如果一定要加耗时的操作，那么务必在新线程里搞
     * @param id
     */
    @Override
    public void pulse(String id) {
        new Thread(()->{
            // 如果你需要在这个方法里搞一些耗时的操作，那么务必要像这样开启一个新线程
            // 不然消费者会被阻塞的
        }).start();
    }

    /**
     * 消费频率限制，默认10毫秒，取值范围：0 - long的最大值，单位：毫秒
     *
     * 如果任务执行的耗时小于execFrequencyLimit，则等待execFrequencyLimit毫秒后再消费下一个任务
     *
     * 首先这是一个生产者和消费者多对多的模型结构，我们以一个生产者对多个消费者来举例
     * 生产者生产的数据只有一份，但是他会推送给多个消费者
     * 而我们之所以要配置多个消费者，是因为需要他们执行不同的业务逻辑
     * 多个消费者执行的业务逻辑不同，也就意味着他们需要的数据大概率会不同
     *
     * 比如消费者A需要处理男性的数据，消费者B需要处理女性的数据
     * 如果生产者刚好连续推送了几批男性的数据，那么这会导致消费者B筛选不到女性数据，那么他就不会处理业务逻辑了
     * 这么一来，消费者B就会无限接近空转，而空转会引起CPU占用率过大，所以必须加以限制
     *
     * 千万不要小看这个问题，本人曾经在实战中亲测过，做不做这个限制，CPU的占有率会达到10倍的差距
     * 当然了，这跟消费者的业务逻辑还是有一定关系的，具体情况具体看待
     * 如果你的消费者几乎不会出现空转，那么这里可以设置为0
     *
     */
    @Override
    public long getExecFrequencyLimit() {
        return super.getExecFrequencyLimit();
    }

    /**
     * 这个方法会接收到生产者推送过来的数据
     * 在里面执行相应的业务逻辑即可
     * @param data
     */
    @Override
    public void doRunner(Object data) {
        // data 可以是任何类型
        // 因为能给他推送数据的消费者是固定的，所以data有可能收到的类型也是固定的
        // 所以我们可以在这里自己判断，然后转化即可
        // 为什么不用泛型？这是为了兼容多个生产者，因为他们推送的数据类型可能会不同
    }
}
```

### 然后将他们添加到同一个组内
```java
// 创建一组生产者与消费者，而这样组可以创建无限个
// 每一组的生产者都只会把数据推送给同一组的消费者
MagicianDataProcessing.getProducerAndConsumerManager()
                .addProducer(new DemoProducer()) // 添加一个生产者（可以添加多个）
                .addConsumer(new DemoConsumer()) // 添加一个消费者（可以添加多个）
                .start();
```
