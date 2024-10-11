---
home: true
heroImage: https://magician-io.com/source/images/logo1.png
actionText: 文档 →
actionLink: /dataprocessing/index.md
footer: 基于MIT协议的开源项目 | QQ群：773291321 | Email - yuyemail@163.com
---

<h2 style="margin:0px;">三大核心</h2>
<div class="features" style="border:0px;margin-top:0px;padding-top:0px;">
<div class="feature">
  <h2>集合处理</h2>
  <p>通过分组+多线程的方式对集合元素进行处理，线程数量完全可控，可以有效提高处理集合元素的效率</p>
</div>
<div class="feature">
  <h2>并发任务</h2>
  <p>
    对于需要并发处理的多个任务，不需要自己创建与管理线程，只需要专注在业务逻辑上
  </p>
</div>
<div class="feature">
  <h2>生产者与消费者模型</h2>
  <p>
    采用多对多模型，多个生产者可以对应多个消费者，这样的对应关系为一组，而这样的组合可以创建多个，并且可以有效避免队列积压
  </p>
</div>
  <!-- <div class="feature">
    <h2>Magician-DataProcessing</h2>
    <p>Magician-DataProcessing 是一个数据处理框架，里面提供了对集合数据的并发处理，生产者与消费者模型，以及并发处理任务等功能</p>
  </div>
  <div class="feature">
    <h2>Magician-Scanning</h2>
    <p>
      Magician-Scanning是一个用Java开发的扫描区块链的工具包，它可以根据开发者的需求来监控交易，它计划支持三个链，ETH（BSC、POLYGON等）、SOL和TRON。
    </p>
  </div>
  <div class="feature">
    <h2>Magician-ContractsTools</h2>
    <p>
      Magician-ContractsTools是一个用于调用智能合约的工具包，你可以非常容易地在Java程序中调用智能合约进行查询和写入操作。
    </p>
  </div> -->
  <!-- <div class="feature">
    <h2>Magician-Containers</h2>
    <p>容器管理模块，可以很方便的对项目中的bean进行管理，当Bean被管理起来以后就可以绑定一些功能上去了，目前绑定的功能有， AOP 和 定时任务</p>
  </div>
  <div class="feature">
    <h2>Magician-Configure</h2>
    <p>配置管理器，它可以轻松地从外部、远程和本地（类资源目录）读取配置文件，并以键值形式缓存在项目中。在获取配置数据时，如果它不在缓存中，它会自动去环境变量中获取</p>
  </div>
  <div class="feature">
    <h2>&nbsp;</h2>
    <p>
      &nbsp;
    </p>
  </div> -->
</div>
<!-- <h2 style="margin:0px;">Web开发</h2>
<div class="features" style="border:0px;margin-top:0px;padding-top:0px;">
  <div class="feature">
    <h2>Magician-Http</h2>
    <p>基于Netty开发的一个 小型Http服务，支持http和WebSocket，可以采用注解来声明Handler</p>
  </div>
  <div class="feature">
    <h2>Magician-Route</h2>
    <p>Magician-Route是由Magician-Web发展而来，主要是去掉了里面的反射，牺牲了一点易用性，将侧重点放在了性能上</p>
  </div>
  <div class="feature">
    <h2>Magician-JDBC</h2>
    <p>一个数据库操作框架，支持多数据源，事务管理，分页查询，单表操作无SQL，复杂操作可以自己写SQL，支持实体参数，支持{}和?占位符</p>
  </div>
</div> -->

<h1 style="width:100%;text-align:center;">Magician-DataProcessing</h1>

## 集合处理

如果我们拿到了一个集合，需要根据里面的每一条数据去做相应的业务逻辑，那么我们一般有两种做法：

1. 迭代一条一条地处理
2. 迭代开启多线程处理

如果数据量很少的情况下，这两者都是一个不错的办法，但如果数据量高达成千上万的时候，这两者就都不是一个好办法了，前者会消耗太多的时间，而后者会开启太多的线程.

所以在处理的时候我们虽然还是会采用多线程，但是需要花时间精力去设计，让速度既能比一条一条处理要高，又不能开启太多的线程，有时候我们还不能异步处理，需要等所有线程结束了才能往下走。

### 我们可以看一下Magician-DataProcessing是如何处理的

假如有一个List需要并发处理里面的元素

```java
List<String> dataList = new ArrayList<>();
```

我们可以将它分成若干组来处理，这些组会排队执行，但是每一组在执行的时候都是并发的，里面的每一个元素都会由单独的线程去处理。需要等一组处理完了，才会处理下一组。

```java
// 只需要将他传入syncRunner方法即可
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

也可以让每一组单独占一个线程，组内的元素依然采用迭代的方式一条条处理。等所有组处理完了，才会进入下一步。

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

## 并发任务

有时候我们会遇到这样的业务逻辑：在同一条业务线里需要做多件事，但是这些事之间没有因果关系，不需要等前一个完成再去做下一个。

面对这样的情况，我们可以采用并发的方式将这多件事一起处理掉，如果我们自己去开启线程，管理线程，设置等待，本身并没啥问题，但如果项目里这样的情况多了以后，就会出现大量冗余的代码。

### 所以Magician-DataProcessing将他封装了

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

## 生产者与消费者模型

当我们在使用生产者与消费者模型的时候，如果不做一些处理，那么很大概率会出现一个问题，如果生产者不管不顾的向消费者推送，而消费者的消费能力又跟不上生产速度，那么很自然的会出现消费者队列积压，造成内存问题。

这样的积压如果时间久了又有可能会引发数据时效性的问题，可能你推送给消费者的时候，这条数据需要处理，但是等到被消费的时候又不需要处理了，这样就容易出现数据错乱的问题。

如果我们加大消费者的数量，又会在一定程度上增加线程数。

### Magician-DataProcessing采用的是限制生产速度的方式来解决

当生产者生产完一批数据后，会不断地监视消费者，当发现了空闲的消费者才会生产和推送下一轮数据，并且数据只会推送给这几个空闲的消费者。

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

<h1 style="width:100%;text-align:center;">更多项目</h1>

<div class="features" style="border:0px;margin-top:0px;padding-top:0px;">
  <div class="feature">
    <h2>Magician-Scanning</h2>
    <p>
      Magician-Scanning是一个用Java开发的扫描区块链的工具包，它可以根据开发者的需求来监控交易，它计划支持三个链，ETH（BSC、POLYGON等）、SOL和TRON。
    </p>
  </div>
  <div class="feature">
    <h2>Magician-ContractsTools</h2>
    <p>
      Magician-ContractsTools是一个用于调用智能合约的工具包，你可以非常容易地在Java程序中调用智能合约进行查询和写入操作。
    </p>
  </div>
  <div class="feature">
    <h2>Magician-Http</h2>
    <p>基于Netty开发的一个 小型Http服务，支持http和WebSocket，可以采用注解来声明Handler</p>
  </div>
  <div class="feature">
    <h2>Magician-Route</h2>
    <p>Magician-Route是由Magician-Web发展而来，主要是去掉了里面的反射，牺牲了一点易用性，将侧重点放在了性能上</p>
  </div>
  <div class="feature">
    <h2>Magician-JDBC</h2>
    <p>一个数据库操作框架，支持多数据源，事务管理，分页查询，单表操作无SQL，复杂操作可以自己写SQL，支持实体参数，支持{}和?占位符</p>
  </div>
  <div class="feature">
    <h2>&nbsp;</h2>
    <p>&nbsp;</p>
  </div>
</div>