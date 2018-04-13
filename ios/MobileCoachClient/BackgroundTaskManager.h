#import <Foundation/Foundation.h>

// BackgroundTaskManager deals with multiple concurrent background tasks.  It holds a dictionary
// of task ids and completion handers in order that more than one can run at once.
// thanks to: http://stackoverflow.com/questions/10319643/objective-c-proper-use-of-beginbackgroundtaskwithexpirationhandler

@interface BackgroundTaskManager : NSObject

typedef void (^CompletionBlock)();

+ (id) sharedTasks;

- (NSUInteger)beginTask;

- (NSUInteger)beginTaskWithCompletionHandler:(CompletionBlock)completionHandler;

- (void)endTaskWithKey:(NSUInteger)taskKey;

- (void) endAllBackgroundTasks;

@end
