#import "BackgroundTaskManager.h"
#import "UIKit/UIKit.h"

@interface BackgroundTaskManager()

@property NSUInteger taskKeyCounter;
@property NSMutableDictionary *tasks;

@end

@implementation BackgroundTaskManager

+ (id)sharedTasks {
  static BackgroundTaskManager *sharedTasks = nil;
  static dispatch_once_t onceToken;
  
  dispatch_once(&onceToken, ^{
    sharedTasks = [[self alloc] init];
  });
  
  return sharedTasks;
}

- (id)init
{
  self = [super init];
  
  if (self) {
    [self setTaskKeyCounter:0];
    [self setTasks:[NSMutableDictionary dictionary]];
  }
  
  return self;
}

- (NSUInteger)beginTask
{
  return [self beginTaskWithCompletionHandler:nil];
}

- (NSUInteger)beginTaskWithCompletionHandler:(CompletionBlock)completionHandler;
{
  //read the counter and increment it
  NSUInteger taskKey;
  
  @synchronized(self) {
    taskKey = self.taskKeyCounter;
    self.taskKeyCounter++;
  }
  
  NSUInteger taskId = [[UIApplication sharedApplication] beginBackgroundTaskWithExpirationHandler:^{
    NSLog(@"Expire bg-task %lu for push notification, task-key: ", (unsigned long)taskKey);
    
    [self endTaskWithKey:taskKey];
  }];
  
  NSLog(@"Started bg-task for push notification task-key: %lu, task-id: %lu", (unsigned long)taskKey, (unsigned long)taskId);
  
  NSMutableDictionary *dict = [[NSMutableDictionary alloc] initWithCapacity:2];
  [dict setObject:[NSNumber numberWithUnsignedLong:taskId] forKey:@"taskId"];
  
  if (completionHandler) {
    [dict setObject:completionHandler forKey:@"completionBlock"];
  }
  
  [self.tasks setObject:dict forKey:[NSNumber numberWithUnsignedLong:taskKey]];
  
  return taskKey;
}

- (void)endTaskWithKey:(NSUInteger)taskKey
{
  @synchronized(self.tasks) {
    NSMutableDictionary *dict = [self.tasks objectForKey:[NSNumber numberWithUnsignedLong:taskKey]];
    
    NSNumber *taskId = [dict objectForKey:@"taskId"];
    CompletionBlock completion = [dict objectForKey:@"completionBlock"];
    
    if (completion) {
      NSLog(@"Ending bg-task for push notification task-key: %lu, task-id: %@", (unsigned long)taskKey, taskId);
      
      completion();
    }
    
    [[UIApplication sharedApplication] endBackgroundTask:[taskId unsignedLongValue]];
    
    NSLog(@"Ended bg-task for push notification task-key: %lu, task-id: %@", (unsigned long)taskKey, taskId);
    
    [self.tasks removeObjectForKey:[NSNumber numberWithUnsignedLong:taskKey]];
  }
}

- (void) endAllBackgroundTasks
{
  for(NSNumber *key in [self.tasks allKeys]) {
    [self endTaskWithKey:[key intValue]];
  }
}

@end
