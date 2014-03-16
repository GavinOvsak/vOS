package vOS.controller;

import java.net.MalformedURLException;

import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

import net.appsdoneright.riftlib.RiftActivity;
import net.appsdoneright.riftlib.util.Quaternion;
import net.appsdoneright.riftlib.util.RiftHandler;

import org.json.JSONObject;

import vOS.controller.R;
import vOS.controller.socket.IOAcknowledge;
import vOS.controller.socket.IOCallback;
import vOS.controller.socket.SocketIO;
import vOS.controller.socket.SocketIOException;
import vOS.controller.util.SystemUiHider;

import android.annotation.TargetApi;
import android.app.Activity;
import android.content.Intent;
import android.graphics.PointF;
import android.opengl.GLSurfaceView.Renderer;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.util.SparseArray;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.animation.AnimationUtils;
import android.view.animation.RotateAnimation;
import android.widget.TextView;
 
/**
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 * 
 * @see SystemUiHider 
 */ 
public class Main extends Activity {
	/**
	 * Whether or not the system UI should be auto-hidden after
	 * {@link #AUTO_HIDE_DELAY_MILLIS} milliseconds.
	 */
	private static final boolean AUTO_HIDE = true; 

	/**
	 * If {@link #AUTO_HIDE} is set, the number of milliseconds to wait after
	 * user interaction before hiding the system UI.
	 */
	private static final int AUTO_HIDE_DELAY_MILLIS = 3000;

	/**
	 * If set, will toggle the system UI visibility upon interaction. Otherwise,
	 * will show the system UI visibility upon interaction.
	 */
	private static final boolean TOGGLE_ON_CLICK = true;
	
	/**
	 * The flags to pass to {@link SystemUiHider#getInstance}.
	 */
	private static final int HIDER_FLAGS = SystemUiHider.FLAG_HIDE_NAVIGATION;

    private volatile Quaternion mQuaternion = new Quaternion();

	/**
	 * The instance of the {@link SystemUiHider} for this activity.
	 */
	private SystemUiHider mSystemUiHider;
	private View contentView;
	private SparseArray<PointF> mActivePointers;
	
	private void hideSystemUI() {
		contentView.setSystemUiVisibility(
	            View.SYSTEM_UI_FLAG_LAYOUT_STABLE
	            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
	            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
	            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION // hide nav bar
	            | View.SYSTEM_UI_FLAG_FULLSCREEN // hide status bar
	            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
//		controlsView.setVisibility(View.GONE);
	}
  
	/*
	public static void close() {
		finish();
	}*/
	
	static Activity that; 
	
	@Override
	protected void onStop() {
		Connection.socket.emit("connection", "cancelled");
		super.onStop();
    	//System.out.println("On Stop");
	}
	
	@Override
	protected void onResume() {
		super.onResume();
		hideSystemUI();
	}
 	
	@Override 
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		that  = this;
			
		setContentView(R.layout.activity_main);
		
	    mActivePointers = new SparseArray<PointF>();
		contentView = findViewById(R.id.fullscreen_content);

		hideSystemUI();
        View decorView = getWindow().getDecorView();
		decorView.setOnSystemUiVisibilityChangeListener
		        (new View.OnSystemUiVisibilityChangeListener() {
		    @Override
		    public void onSystemUiVisibilityChange(int visibility) {
	        	hideSystemUI();
		    }
		});
		
		contentView.getViewTreeObserver().addOnGlobalLayoutListener(new ViewTreeObserver.OnGlobalLayoutListener() {
	        @Override
	        public void onGlobalLayout() {
	        	contentView.getViewTreeObserver().removeOnGlobalLayoutListener(this);
	        	Connection.socket.emit("quaternion", "{\"w\": " + mQuaternion.w + ",\"x\":" + mQuaternion.x + ",\"y\":" + mQuaternion.y + ",\"z\":" + mQuaternion.z + "}");
	        	System.out.println("{\"w\": " + mQuaternion.w + ",\"x\":" + mQuaternion.x + ",\"y\":" + mQuaternion.y + ",\"z\":" + mQuaternion.z + "}");
	        	Connection.socket.emit("size", "{\"width\": " + contentView.getHeight() + ",\"height\":"+ contentView.getWidth() +"}");
				if ((contentView.getSystemUiVisibility()&View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) != View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) {
					hideSystemUI(); 
				}
	        }
	    }); 

 		contentView.setOnTouchListener(new View.OnTouchListener() {
			@Override
			public boolean onTouch(View v, MotionEvent event) {
			    int pointerIndex = event.getActionIndex();
			    int pointerId = event.getPointerId(pointerIndex);
			    int maskedAction = event.getActionMasked();
				if ((contentView.getSystemUiVisibility()&View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) != View.SYSTEM_UI_FLAG_HIDE_NAVIGATION) {
					hideSystemUI();
				}

				float newX = (float) (event.getY(pointerIndex)/contentView.getHeight());
				float newY = (float) (event.getX(pointerIndex)/contentView.getWidth());
			    switch (maskedAction) {
				    case MotionEvent.ACTION_DOWN:
				    case MotionEvent.ACTION_POINTER_DOWN: {
				      newX = (float) (event.getY(pointerIndex)/contentView.getHeight());
				      newY = (float) (event.getX(pointerIndex)/contentView.getWidth());
				      System.out.println("Start Id: " + pointerId);
				      System.out.println("X: " + newX);
				      System.out.println("Y: " + newY);
				      int i = pointerIndex;
				      if(Connection.socket != null) {
				    	  Connection.socket.emit("start", "{\"i\": " + pointerId+",\"x\":"+newX+",\"y\":"+newY+"}");
				      }
				      PointF f = new PointF();
				      f.x = newX;
				      f.y = newY;
				      mActivePointers.put(pointerId, f);
				      break;
				    }
				    case MotionEvent.ACTION_MOVE: { // a pointer was moved
				      for (int size = event.getPointerCount(), i = 0; i < size; i++) {
				        PointF point = mActivePointers.get(event.getPointerId(i));
				        if (point != null) {
					      newX = (float) (event.getY(i)/contentView.getHeight());
					      newY = (float) (event.getX(i)/contentView.getWidth());
				          //point.x = event.getX(i);
				          //point.y = event.getY(i);
					      System.out.println("Move Id: " + event.getPointerId(i));
				          System.out.println("X: " + newX);
				          System.out.println("Y: " + newY);
				          if(Connection.socket != null) {
				        	  Connection.socket.emit("move", "{\"i\": " + event.getPointerId(i) +",\"x\":"+newX+",\"y\":"+newY+"}");
				          }
				        }
				      }
				      break; 
				    }
				    case MotionEvent.ACTION_UP: 
				    case MotionEvent.ACTION_POINTER_UP:
				    case MotionEvent.ACTION_CANCEL: {
					    newX = (float) (event.getY(pointerIndex)/contentView.getHeight());
					    newY = (float) (event.getX(pointerIndex)/contentView.getWidth());
				    	System.out.println("End Id: " + pointerId);
				        System.out.println("X: " + newX);
				        System.out.println("Y: " + newY);
				        int i = pointerIndex;
				        if(Connection.socket != null) {
				        	Connection.socket.emit("end", "{\"i\": " + pointerId +",\"x\":"+newX+",\"y\":"+newY+"}");
				        }
				        mActivePointers.remove(pointerId);
				      break;
				    }
			    }
			    return true;
			}
			 
		});
		hideSystemUI();
	}
/*
	@Override
	protected void onPostCreate(Bundle savedInstanceState) {
		super.onPostCreate(savedInstanceState);

		// Trigger the initial hide() shortly after the activity has been
		// created, to briefly hint to the user that UI controls
		// are available.
		//delayedHide(100);
	}
*/
	/**
	 * Touch listener to use for in-layout UI controls to delay hiding the
	 * system UI. This is to prevent the jarring behavior of controls going away
	 * while interacting with activity UI.
	 */
	View.OnTouchListener mDelayHideTouchListener = new View.OnTouchListener() {
		@Override
		public boolean onTouch(View view, MotionEvent motionEvent) {
			if (AUTO_HIDE) {
				delayedHide(AUTO_HIDE_DELAY_MILLIS);
			}
			return false;
		}
	};

	Handler mHideHandler = new Handler();
	Runnable mHideRunnable = new Runnable() {
		@Override
		public void run() {
			mSystemUiHider.hide();
		}
	};

	/**
	 * Schedules a call to hide() in [delay] milliseconds, canceling any
	 * previously scheduled calls.
	 */
	private void delayedHide(int delayMillis) {
		mHideHandler.removeCallbacks(mHideRunnable);
		mHideHandler.postDelayed(mHideRunnable, delayMillis);
	}
}
