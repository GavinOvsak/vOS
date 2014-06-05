package vOS.controller;

import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.MalformedURLException;

import javax.microedition.khronos.egl.EGLConfig;
import javax.microedition.khronos.opengles.GL10;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import vOS.controller.R;
import vOS.controller.socket.IOAcknowledge;
import vOS.controller.socket.IOCallback;
import vOS.controller.socket.SocketIO;
import vOS.controller.socket.SocketIOException;
import vOS.controller.util.SystemUiHider;

import android.annotation.TargetApi;
import android.app.Activity;
import android.app.ActivityManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ConfigurationInfo;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Matrix;
import android.graphics.PointF;
import android.graphics.RectF;
import android.hardware.Sensor;
import android.hardware.SensorEvent;
import android.hardware.SensorEventListener;
import android.hardware.SensorManager;
import android.net.Uri;
import android.opengl.GLSurfaceView;
import android.opengl.GLSurfaceView.Renderer;
import android.os.Build; 
import android.os.Bundle;
import android.os.Handler;
import android.provider.MediaStore;
import android.util.Base64;
import android.util.SparseArray;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewTreeObserver;
import android.view.animation.AnimationUtils;
import android.view.animation.RotateAnimation;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageView;
import android.widget.ImageView.ScaleType;
import android.widget.TextView;
import android.widget.Toast;
 
/** 
 * An example full-screen activity that shows and hides the system UI (i.e.
 * status bar and navigation/system bar) with user interaction.
 * 
 * @see SystemUiHider 
 */ 
public class ControlPanel extends Activity implements SensorEventListener {
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

	/**
	 * The instance of the {@link SystemUiHider} for this activity.
	 */
	private SystemUiHider mSystemUiHider;
	private ImageView contentView;
	private SparseArray<PointF> mActivePointers;
	private boolean mInitialized;
	private SensorManager mSensorManager;
	private Sensor mAccelerometer;
	private final float NOISE = (float) 2.0;
	
	
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
	private Matrix matrix;

	
	@Override
	protected void onStop() {
		PairCode.socket.emit("connection", "cancelled");
		super.onStop();
    	//System.out.println("On Stop");
	}
 	
	@Override
	protected void onResume() {
		super.onResume();
		hideSystemUI();
		
		mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);
	}
		 
	@Override
	protected void onPause()
	{
	    // The activity must call the GL surface view's onPause() on activity onPause().
	    super.onPause();
	    mSensorManager.unregisterListener(this);
	}
 	
	public void updatePanel(String dataURI) {
		byte[] bytes = Base64.decode(dataURI, Base64.DEFAULT);
		Bitmap bmp = BitmapFactory.decodeByteArray(bytes, 0, bytes.length);
		Matrix matrix = new Matrix();
		matrix.postRotate(90);
		Bitmap rotatedBmp = Bitmap.createBitmap(bmp, 0, 0, 
				bmp.getWidth(), bmp.getHeight(), matrix, true);
		contentView.setScaleType(ScaleType.FIT_XY);
		contentView.setImageBitmap(rotatedBmp);

/*		matrix = new Matrix();
		matrix.postRotate((float) 90, 
				contentView.getDrawable().getBounds().width()/2, 
				contentView.getDrawable().getBounds().height()/2);
		contentView.setImageMatrix(matrix);*/
	}
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		that  = this;
		PairCode.ctrlReference = this;
		
		mSensorManager = (SensorManager) getSystemService(Context.SENSOR_SERVICE);
		mAccelerometer = mSensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER);
		mSensorManager.registerListener(this, mAccelerometer, SensorManager.SENSOR_DELAY_NORMAL);
		
		setContentView(R.layout.controlpanel);

		contentView = (ImageView)findViewById(R.id.image);
//		contentView.setScaleType(ScaleType.MATRIX);

//		matrix = new Matrix();
//		matrix.postRotate(90);
		
	    mActivePointers = new SparseArray<PointF>();
		
		final ActivityManager activityManager = (ActivityManager) getSystemService(Context.ACTIVITY_SERVICE);
	    final ConfigurationInfo configurationInfo = activityManager.getDeviceConfigurationInfo();
	   
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
	        	PairCode.socket.emit("size", "{\"width\": " + contentView.getHeight() + ",\"height\":"+ contentView.getWidth() +"}");
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
				      int i = pointerIndex;
				      if(PairCode.socket != null) {
				    	  PairCode.socket.emit("start", "{\"i\": " + pointerId+",\"x\":"+newX+",\"y\":"+newY+"}");
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
				          if(PairCode.socket != null) {
				        	  PairCode.socket.emit("move", "{\"i\": " + event.getPointerId(i) +",\"x\":"+newX+",\"y\":"+newY+"}");
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
				        int i = pointerIndex;
				        if(PairCode.socket != null) {
				        	PairCode.socket.emit("end", "{\"i\": " + pointerId +",\"x\":"+newX+",\"y\":"+newY+"}");
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

	@Override
	public void onAccuracyChanged(Sensor sensor, int accuracy) {		
	}

	@Override
	public void onSensorChanged(SensorEvent event) {
		float x = event.values[0];
		float y = event.values[1];
		float z = event.values[2];
		
		if(PairCode.socket != null) {
        	PairCode.socket.emit("value", "{\"Accel\": {\"x\":" + x +",\"y\":" + y +",\"z\":" + z + "}}");
        }
	}
}
