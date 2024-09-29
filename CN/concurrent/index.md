# Magician-Concurrent

Magician-Concurrent 是一个并发编程工具包，当你需要并发执行某些代码的时候，不需要自己创建和管理线程，除此之外里面还提供了生产者与消费者模型

## 初始化配置

### 导入依赖

```xml
<dependency>
    <groupId>com.github.yuyenews</groupId>
    <artifactId>Magician-Concurrent</artifactId>
    <version>1.0.0</version>
</dependency>
```

## 并发处理任务

示例

```java
MagicianConcurrent.getConcurrentTaskSync()
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

里面的每一个任务都是并发执行的，但是这个整体是同步的，而同步



## 并发处理List里的元素

### 同步执行

每个元素并发执行

```java
// 假如有一个List需要并发处理里面的元素
List<String> dataList = new ArrayList<>();

// 只需要将他传入syncRunner方法即可，每个参数的具体含义可以参考文档
MagicianConcurrent.getConcurrentListSync()
        .syncRunner(dataList, data -> {

            // 这里可以拿到List里的元素，进行处理
            System.out.println(data);
        
        }, 10, 1, TimeUnit.MINUTES);
```

每一组并发执行

```java
// 也可以用syncGroupRunner方法，每个参数的具体含义可以参考文档
MagicianConcurrent.getConcurrentListSync()
        .syncGroupRunner(dataList, data -> {

            // 这里可以拿到List里的元素，进行处理
            System.out.println(data);
        
        }, 10, 1, TimeUnit.MINUTES);
```

### 异步执行

每个元素并发执行

```java
// 假如有一个List需要并发处理里面的元素
List<String> dataList = new ArrayList<>();

// 只需要将他传入asyncRunner方法即可，每个参数的具体含义可以参考文档
MagicianConcurrent.getConcurrentListAsync(1, 10, 1, TimeUnit.MINUTES)
        .asyncRunner(dataList, data -> {

            // 这里可以拿到List里的元素，进行处理
            System.out.println(data);
    
        }, 10, 1, TimeUnit.MINUTES);
```

每一组并发执行

```java
// 也可以用asyncGroupRunner方法，每个参数的具体含义可以参考文档
MagicianConcurrent.getConcurrentListAsync(1, 10, 1, TimeUnit.MINUTES)
        .asyncGroupRunner(dataList, data -> {
        
            // 这里可以拿到List里的元素，进行处理
            System.out.println(data);
        
        }, 10, 1, TimeUnit.MINUTES);
```

## 生产者与消费者

```java
// 创建一组生产者与消费者，支持多对多
MagicianConcurrent.getJobManager()
        .addProducer(new MagicianProducer() { // 添加一个生产者（可以添加多个）
            @Override
            public String getId() {
                // 设置ID，必须全局唯一
                return "producerOne";
            }

            @Override
            public boolean getLoop() {
                // 重复执行producer方法，具体意义可以参考文档
                return true;
            }
            
            @Override
            public void producer() {
                for(int i=0;i<10;i++){
                    
                    // 将数据发布给消费者
                    this.publish(i);
                }
            }
        }).addConsumer(new MagicianConsumer() { // 添加一个消费者（可以添加多个）
            @Override
            public String getId() {
                // 设置ID，必须全局唯一
                return "consumerOne";
            }
        
            @Override
            public long getExecFrequencyLimit() {
                // 设置消费频率限制，具体意义可以参考文档
                return 500;
            }
            
            @Override
            public void doRunner(Object data) {
                // 处理生产者发来的数据
                System.out.println(data);
            }
        }).start();
```