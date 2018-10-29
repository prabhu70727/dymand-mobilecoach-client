package org.c4dhi.mobilecoach.client;

public class LocalTimer {

  public static long curTime(){
    return System.currentTimeMillis();
  }

  public static void blockingLoop(int time) {
    long endLoop = curTime() + time;
    while(curTime()<endLoop);
  }
}
