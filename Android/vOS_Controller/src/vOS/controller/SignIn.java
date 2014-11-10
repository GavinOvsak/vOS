package vOS.controller;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.UnsupportedEncodingException;
import java.net.MalformedURLException;
import java.util.ArrayList;
import java.util.List;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.NameValuePair;
import org.apache.http.client.ClientProtocolException;
import org.apache.http.client.HttpClient;
import org.apache.http.client.entity.UrlEncodedFormEntity;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONException;
import org.json.JSONObject;

import vOS.controller.R;
import vOS.controller.socket.IOAcknowledge;
import vOS.controller.socket.IOCallback;
import vOS.controller.socket.SocketIO;
import vOS.controller.socket.SocketIOException;
import android.app.ActionBar;
import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.SharedPreferences.Editor;
import android.net.Uri;
import android.os.AsyncTask;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

public class SignIn extends Activity {
	
	private EditText name;
	private EditText email;
	private EditText password;
	private EditText confirmPassword;
	private Button change;
	private Button submit;
	private Button forgotButton;
	
	private boolean isRegistering = false;
	
	static String token = "";
	static String userName = "";
	static JSONObject user = null;
	
	private Activity that;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(this);
		token = settings.getString("token", "");
		userName = settings.getString("name", "");
		
		//If shared preference has token and name, open pair code. Else, sign in	
		if (token != "" && userName != "") {
			Intent intent = new Intent(getApplicationContext(), PairCode.class);
			startActivity(intent);
		}
					
		that = this;
		setContentView(R.layout.signin);
		name = (EditText)findViewById(R.id.name);
		email = (EditText)findViewById(R.id.email);
		password = (EditText)findViewById(R.id.password);
		confirmPassword = (EditText)findViewById(R.id.confirmPassword);
		submit = (Button)findViewById(R.id.submit);
		forgotButton = (Button)findViewById(R.id.forgotButton);
		change = (Button)findViewById(R.id.change);
		final ActionBar actionBar = getActionBar();
	    actionBar.show();
	    actionBar.setTitle(" Please Sign In");

	    forgotButton.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				Intent browserIntent = new Intent(Intent.ACTION_VIEW, Uri.parse("http://vos.jit.su/forgot"));
				startActivity(browserIntent);
			}
	    });
	    
		change.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				if (isRegistering) {
					submit.setText("Sign In");
					change.setText("Register");
					actionBar.setTitle(" Please Sign In");
					name.setVisibility(View.GONE);
				} else {
					submit.setText("Submit");
					change.setText("Go to Sign In");
					actionBar.setTitle(" Please Register");
					name.setVisibility(View.VISIBLE);
				}
				isRegistering = !isRegistering;
			}
		});
		
		submit.setOnClickListener(new View.OnClickListener() {
			@Override
			public void onClick(View v) {
				String nameValue = name.getText().toString();
				String emailValue = email.getText().toString();
				String passwordValue = password.getText().toString();
				String confirmPasswordValue = confirmPassword.getText().toString();
				
				if (!isRegistering || (confirmPasswordValue.equals(passwordValue) && passwordValue.length() >= 6)) {
					PostTask tk = new PostTask(nameValue, emailValue, passwordValue);
					tk.execute(); 
				} else if (isRegistering && passwordValue.length() <= 6) {
					toast("Password must be at least 6 characters long");
				} else if (isRegistering && !confirmPasswordValue.equals(passwordValue)) {
					toast("Passwords don't match");
				}
			}
		});
	}

	public void end() {
		if (ControlPanel.that != null) {
			ControlPanel.that.finish();
			toast("Connection Ended");
		}
	}
	
	public void start() {
		Intent intent = new Intent(this, ControlPanel.class);
		startActivity(intent);
	}
	
	public void toast(final String message) {
		SignIn.this.runOnUiThread(new Runnable() {
		  public void run() {
		    Toast.makeText(SignIn.this, message, Toast.LENGTH_SHORT).show();
		  }
		});
	}
	

	
	private class PostTask extends AsyncTask<NameValuePair, Void, JSONObject> {
		String name;
		String email;
		String password;
		JSONObject json;

		public PostTask(String name, String email, String password) {
			this.name = name;
			this.email = email;
			this.password = password;
		}

		@Override
		protected JSONObject doInBackground(NameValuePair... params) {
			//JSONParser jsonParser = new JSONParser();
			HttpClient httpClient = new DefaultHttpClient();
		    HttpPost httpPost = new HttpPost("http://vos.jit.su/registerForToken");

		    //Send post request to register, get token and user
		    
	        InputStream is = null;
	        JSONObject json = null;
			try {
		        List<NameValuePair> nameValuePairs = new ArrayList<NameValuePair>(2);
		        nameValuePairs.add(new BasicNameValuePair("name", this.name));
		        nameValuePairs.add(new BasicNameValuePair("email", this.email));
		        nameValuePairs.add(new BasicNameValuePair("password", this.password));
		        
		        System.out.println("name" + this.name);
		        System.out.println("email" + this.email);
		        System.out.println("password" + this.password);
		        
		        httpPost.setEntity(new UrlEncodedFormEntity(nameValuePairs));
				HttpResponse response = httpClient.execute(httpPost);
			    HttpEntity httpEntity = response.getEntity();
			    
			    is = httpEntity.getContent();
			    BufferedReader streamReader = new BufferedReader(new InputStreamReader(is, "UTF-8")); 
			    StringBuilder responseStrBuilder = new StringBuilder();

			    String inputStr;
			    while ((inputStr = streamReader.readLine()) != null)
			        responseStrBuilder.append(inputStr);

			    System.out.println(responseStrBuilder.toString());
			    user = new JSONObject(responseStrBuilder.toString());
			} catch (UnsupportedEncodingException e) {
			} catch (ClientProtocolException e) {
			} catch (IOException e) {
			} catch (JSONException e) {
			}

			//Get token
			try { 
				if (user != null && user.get("token") != null && user.get("name") != null) {
					token = user.get("token").toString();
					userName = user.get("name").toString();
				} else {
					if (isRegistering) {
						toast("That email is already taken");
					} else {
						toast("Incorrect password");
					}
				}
			} catch (JSONException e) {
			}
			
			if (token != "" && userName != "") {				

				Editor edit = PreferenceManager.getDefaultSharedPreferences(getApplicationContext()).edit();
				edit.putString("token", token);
				edit.putString("name", userName);
				edit.apply();
				
				//Go to PairCode, give name of user and token
				Intent intent = new Intent(getApplicationContext(), PairCode.class);
				startActivity(intent);
			}
		
			return user;
		}
	}
}
