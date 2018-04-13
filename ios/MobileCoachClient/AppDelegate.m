/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
// ADDED FOR FABRIC - START
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>
// ADDED FOR FABRIC - END

#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

// ADDED FOR PUSH NOTIFICATIONS - START
#import <React/RCTPushNotificationManager.h>
// ADDED FOR PUSH NOTIFICATIONS - STOP

// ADDED FOR BACKGROUND HACK - START
#import "BackgroundTaskManager.h"
// ADDED FOR BACKGROUND HACK - STOP

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // ADDED FOR FABRIC - START
  [Fabric with:@[[Crashlytics class]]];
  // ADDED FOR FABRIC - END
  
  NSURL *jsCodeLocation;

  jsCodeLocation = [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index.ios" fallbackResource:nil];

  RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                               moduleName:@"MobileCoachClient"
                                               initialProperties:nil
                                               launchOptions:launchOptions];
  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  return YES;
}

// ADDED FOR PUSH NOTIFICATIONS - START
// Required to register for notifications
- (void)application:(UIApplication *)application didRegisterUserNotificationSettings:(UIUserNotificationSettings *)notificationSettings
{
  [RCTPushNotificationManager didRegisterUserNotificationSettings:notificationSettings];
}
// Required for the register event.
- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken
{
  [RCTPushNotificationManager didRegisterForRemoteNotificationsWithDeviceToken:deviceToken];
}
// Required for the notification event. You must call the completion handler after handling the remote notification.
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification
fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))completionHandler
{
  NSLog(@"push-notification received: %@", notification);
  //[RCTPushNotificationManager didReceiveRemoteNotification:notification fetchCompletionHandler:completionHandler];
  
  NSUInteger taskKey = [[BackgroundTaskManager sharedTasks] beginTaskWithCompletionHandler:^{
    NSLog(@"push-notification bg-task complete: %@", notification);
  }];
  
  [RCTPushNotificationManager didReceiveRemoteNotification:notification fetchCompletionHandler:^(UIBackgroundFetchResult result) {
    NSLog(@"push-notification bg-task completionHandler, result code: %lu, task-key: %lu", (unsigned long)result, (unsigned long)taskKey);
    completionHandler(result);
    [[BackgroundTaskManager sharedTasks] endTaskWithKey:taskKey];
  }];
}
// Required for the notification event. (Old version.)
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification
{
  NSLog(@"push-notification received (the old way): %@", notification);
  [RCTPushNotificationManager didReceiveRemoteNotification:notification];
}
// Required for the registrationError event.
- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error
{
  [RCTPushNotificationManager didFailToRegisterForRemoteNotificationsWithError:error];
}
// Required for the localNotification event.
- (void)application:(UIApplication *)application didReceiveLocalNotification:(UILocalNotification *)notification
{
  [RCTPushNotificationManager didReceiveLocalNotification:notification];
}
// ADDED FOR PUSH NOTIFICATIONS - END

@end
