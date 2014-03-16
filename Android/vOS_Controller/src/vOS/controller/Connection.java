package vOS.controller;

import java.net.MalformedURLException;

import net.appsdoneright.riftlib.RiftActivity;
import net.appsdoneright.riftlib.util.Quaternion;
import net.appsdoneright.riftlib.util.RiftHandler;

import org.json.JSONException;
import org.json.JSONObject;

import vOS.controller.R;
import vOS.controller.socket.IOAcknowledge;
import vOS.controller.socket.IOCallback;
import vOS.controller.socket.SocketIO;
import vOS.controller.socket.SocketIOException;
import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class Connection extends RiftActivity implements RiftHandler {
	
	private View connect;
	private EditText code;
	static SocketIO socket;
	private Activity that;
	private volatile Quaternion mQuaternion = new Quaternion();
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setRiftHandler(this);
		that = this;
		setContentView(R.layout.code);
		connect = findViewById(R.id.connect);
		code = (EditText)findViewById(R.id.code);
		try {
			Connection.socket = new SocketIO("http://gavinovsak-vos.nodejitsu.com/");
			Connection.socket.connect(new IOCallback() {
		        @Override
		        public void on(String event, IOAcknowledge ack, Object... args) {
					if (event.equals("response") && args.length > 0) {
		        		if (args[0].equals("correct pair code")) {
		        			start();
		        			toast("Connecting");
		        		} else if (args[0].equals("ready")) {
		        			toast("Connected");
		        		}
		        	}
		        	
		        	if (event.equals("error")) {
		        		if (args.length > 0 && args[0].equals("incorrect pair code")) {
		        			toast("Incorrect Code");
		        		}
		        		// && args.length > 0 && args[0].equals("disconnected output")) {
	        			//Toast.makeText(that, "Connection Ended", Toast.LENGTH_SHORT).show();
	        			end();
		        	}
		        	//on event: "disconnected", go back and notify.
		        }
				@Override
				public void onDisconnect() {
					System.out.println("Disconnected S.IO");
					end();
				}
				@Override 
				public void onConnect() {
					System.out.println("Connected S.IO");
				}
				@Override
				public void onMessage(String data, IOAcknowledge ack) {
				}
				@Override
				public void onMessage(JSONObject json, IOAcknowledge ack) {
				}
				@Override
				public void onError(SocketIOException socketIOException) {
					System.out.println("Error");
				}
		    });
			
			JSONObject data = new JSONObject();
			try {
				data.put("type", "input");
				data.put("user_id", "1");
			} catch (JSONException e) {}
			Connection.socket.emit("declare-type", data);
		    //System.out.println("{\"width\": " + contentView.getWidth() + ",\"height\":"+ contentView.getHeight() +"}");
//		    socket.emit("size", "{\"width\": " + this.getWidth() + ",\"height\":"+ this.getHeight() +"}");
		} catch (MalformedURLException e) {
			System.out.println("EXCEPTION");
		}
		
		/*connect.setOnTouchListener(new View.OnTouchListener() {
			@Override
			public boolean onTouch(View arg0, MotionEvent arg1) {
				
				return false;
			}
		});*/
	}
	
	public void end() {
//		Main.this.finish(); 
		if (Main.that != null) {
			Main.that.finish();
			toast("Connection Ended");
		}
		//finish(); //Go back to code screen.
	}
	
	public void start() {
		Intent intent = new Intent(this, Main.class);
		startActivity(intent);
	}
	
	public void toast(final String message) {
		Connection.this.runOnUiThread(new Runnable() {
		  public void run() {
		    Toast.makeText(Connection.this, message, Toast.LENGTH_SHORT).show();
		  }
		});
	}
	
	public void connect(View view) {
	    Connection.socket.emit("code", code.getText().toString());
		code.setText("");
//		start();
/*		Intent intent = new Intent(this, Main.class);
		System.out.println("Front code: " + code.getText());
		intent.putExtra("code", code.getText().toString());
		startActivity(intent);*/
	}
	
	@Override
	public void onDataReceived(Quaternion q, int frequency) {
		mQuaternion.set(q);
		//Send to output
		if(Connection.socket != null) {
			Connection.socket.emit("quaternion", "{\"w\": " + q.w + ",\"x\":" + q.x + ",\"y\":" + q.y + ",\"z\":" + q.z + "}");
	    }
	}

	@Override
	public void onKeepAlive(boolean result) {
		
	}
}
