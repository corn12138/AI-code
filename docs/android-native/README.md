# Android 原生应用文档

## 项目概述

Android 原生应用是一个使用 Kotlin 和 Android Jetpack 构建的现代化 Android 应用，主要功能是作为移动工作台的原生容器，通过 WebView 嵌入 H5 应用，并提供丰富的原生功能支持。

## 技术栈

### 核心技术
- **语言**: Kotlin
- **架构**: MVVM + Jetpack Compose
- **WebView**: Android WebView
- **桥接**: JavascriptInterface
- **网络**: Retrofit2 + OkHttp3
- **数据库**: Room
- **依赖注入**: Hilt
- **异步处理**: Kotlin Coroutines
- **最低支持**: Android 7.0 (API 24)

### 架构特点
- 🏗️ MVVM + Repository 模式
- 🌉 JavaScript Bridge 通信
- 📱 Jetpack Compose UI
- 🔄 协程异步处理
- 🛡️ 安全存储
- 📊 性能监控

## 项目结构

```
apps/android-native/app/
├── src/main/
│   ├── java/com/workbench/mobile/
│   │   ├── MainActivity.kt           # 主Activity
│   │   ├── WorkbenchApplication.kt   # 应用入口
│   │   ├── ui/                       # UI层
│   │   │   ├── home/                 # 首页模块
│   │   │   │   ├── HomeActivity.kt
│   │   │   │   ├── HomeViewModel.kt
│   │   │   │   └── HomeScreen.kt
│   │   │   ├── webview/              # WebView模块
│   │   │   │   ├── WebViewActivity.kt
│   │   │   │   ├── WebViewViewModel.kt
│   │   │   │   └── WebViewScreen.kt
│   │   │   └── splash/               # 启动页
│   │   │       ├── SplashActivity.kt
│   │   │       └── SplashScreen.kt
│   │   ├── data/                     # 数据层
│   │   │   ├── repository/           # 仓库模式
│   │   │   │   ├── UserRepository.kt
│   │   │   │   └── AppRepository.kt
│   │   │   ├── local/                # 本地数据
│   │   │   │   ├── database/         # Room数据库
│   │   │   │   ├── prefs/            # SharedPreferences
│   │   │   │   └── cache/            # 缓存管理
│   │   │   ├── remote/               # 远程数据
│   │   │   │   ├── api/              # API接口
│   │   │   │   └── dto/              # 数据传输对象
│   │   │   └── model/                # 数据模型
│   │   ├── domain/                   # 业务逻辑层
│   │   │   ├── usecase/              # 用例
│   │   │   └── model/                # 业务模型
│   │   ├── service/                  # 服务层
│   │   │   ├── WebBridgeService.kt   # 桥接服务
│   │   │   ├── NetworkService.kt     # 网络服务
│   │   │   ├── StorageService.kt     # 存储服务
│   │   │   └── NotificationService.kt # 通知服务
│   │   ├── utils/                    # 工具类
│   │   │   ├── Extensions.kt         # 扩展函数
│   │   │   ├── Constants.kt          # 常量定义
│   │   │   ├── Logger.kt             # 日志工具
│   │   │   └── NetworkUtils.kt       # 网络工具
│   │   └── di/                       # 依赖注入
│   │       ├── AppModule.kt          # 应用模块
│   │       ├── DatabaseModule.kt     # 数据库模块
│   │       └── NetworkModule.kt      # 网络模块
│   ├── res/                          # 资源文件
│   │   ├── layout/                   # 布局文件
│   │   ├── values/                   # 值资源
│   │   ├── drawable/                 # 图片资源
│   │   └── xml/                      # XML配置
│   └── AndroidManifest.xml           # 清单文件
├── build.gradle.kts                  # 模块构建脚本
├── proguard-rules.pro               # 混淆规则
└── README.md                        # 模块说明
```

## 核心功能

### 1. 应用入口与初始化

```kotlin
// WorkbenchApplication.kt
@HiltAndroidApp
class WorkbenchApplication : Application() {
    
    override fun onCreate() {
        super.onCreate()
        
        // 初始化日志
        initLogger()
        
        // 初始化网络监控
        initNetworkMonitoring()
        
        // 初始化崩溃监控
        initCrashReporting()
    }
    
    private fun initLogger() {
        if (BuildConfig.DEBUG) {
            Logger.enableDebug()
        }
    }
}
```

### 2. WebView Activity

```kotlin
// WebViewActivity.kt
@AndroidEntryPoint
class WebViewActivity : ComponentActivity() {
    
    private val viewModel: WebViewViewModel by viewModels()
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        setContent {
            WorkbenchTheme {
                WebViewScreen(
                    viewModel = viewModel,
                    onNavigateBack = { finish() }
                )
            }
        }
    }
}
```

### 3. WebView Compose组件

```kotlin
// WebViewScreen.kt
@Composable
fun WebViewScreen(
    viewModel: WebViewViewModel,
    onNavigateBack: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsState()
    
    Column(modifier = Modifier.fillMaxSize()) {
        // 顶部工具栏
        if (uiState.showToolbar) {
            WebViewToolbar(
                title = uiState.title,
                canGoBack = uiState.canGoBack,
                onBackClick = { viewModel.goBack() },
                onRefreshClick = { viewModel.refresh() }
            )
        }
        
        // WebView容器
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    settings.apply {
                        javaScriptEnabled = true
                        domStorageEnabled = true
                        allowFileAccess = true
                        allowContentAccess = true
                        mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    }
                    
                    // 添加JavaScript接口
                    addJavascriptInterface(
                        WebBridgeService(context, viewModel),
                        "nativeBridge"
                    )
                    
                    webViewClient = CustomWebViewClient(viewModel)
                    webChromeClient = CustomWebChromeClient(viewModel)
                }
            },
            update = { webView ->
                if (uiState.shouldLoadUrl) {
                    webView.loadUrl(uiState.currentUrl)
                    viewModel.onUrlLoaded()
                }
            }
        )
        
        // 加载指示器
        if (uiState.isLoading) {
            LinearProgressIndicator(
                modifier = Modifier.fillMaxWidth()
            )
        }
    }
}
```

### 4. JavaScript Bridge服务

```kotlin
// WebBridgeService.kt
class WebBridgeService(
    private val context: Context,
    private val viewModel: WebViewViewModel
) {
    
    @JavascriptInterface
    fun callNative(methodName: String, params: String) {
        Logger.debug("Bridge call: $methodName with params: $params")
        
        try {
            val paramsJson = JSONObject(params)
            
            when (methodName) {
                "getDeviceInfo" -> handleGetDeviceInfo(paramsJson)
                "showToast" -> handleShowToast(paramsJson)
                "openCamera" -> handleOpenCamera(paramsJson)
                "getLocation" -> handleGetLocation(paramsJson)
                "saveToGallery" -> handleSaveToGallery(paramsJson)
                "shareContent" -> handleShareContent(paramsJson)
                "vibrate" -> handleVibrate(paramsJson)
                "setStatusBar" -> handleSetStatusBar(paramsJson)
                "openApp" -> handleOpenApp(paramsJson)
                else -> {
                    Logger.warning("Unknown bridge method: $methodName")
                    callJavaScript("onNativeError", JSONObject().apply {
                        put("error", "Unknown method: $methodName")
                        put("callbackId", paramsJson.optString("callbackId"))
                    })
                }
            }
        } catch (e: Exception) {
            Logger.error("Bridge call failed: ${e.message}")
            callJavaScript("onNativeError", JSONObject().apply {
                put("error", e.message)
            })
        }
    }
    
    private fun callJavaScript(method: String, data: JSONObject) {
        val script = """
            if (window.nativeBridge && window.nativeBridge.onNativeMessage) {
                window.nativeBridge.onNativeMessage('$method', $data);
            }
        """.trimIndent()
        
        (context as? Activity)?.runOnUiThread {
            viewModel.executeJavaScript(script)
        }
    }
}
```

### 5. 设备信息获取

```kotlin
// 设备信息扩展
private fun handleGetDeviceInfo(params: JSONObject) {
    val deviceInfo = JSONObject().apply {
        put("platform", "Android")
        put("version", Build.VERSION.RELEASE)
        put("model", Build.MODEL)
        put("brand", Build.BRAND)
        put("manufacturer", Build.MANUFACTURER)
        put("isNative", true)
        put("appVersion", BuildConfig.VERSION_NAME)
        put("packageName", context.packageName)
        put("screenSize", JSONObject().apply {
            val displayMetrics = context.resources.displayMetrics
            put("width", displayMetrics.widthPixels)
            put("height", displayMetrics.heightPixels)
            put("density", displayMetrics.density)
        })
        put("networkType", getNetworkType())
        put("batteryLevel", getBatteryLevel())
    }
    
    val callbackId = params.optString("callbackId")
    if (callbackId.isNotEmpty()) {
        callJavaScript("callback", JSONObject().apply {
            put("callbackId", callbackId)
            put("data", deviceInfo)
        })
    }
}
```

### 6. 原生功能实现

#### Toast提示
```kotlin
private fun handleShowToast(params: JSONObject) {
    val message = params.optString("message", "")
    val duration = if (params.optString("duration") == "long") {
        Toast.LENGTH_LONG
    } else {
        Toast.LENGTH_SHORT
    }
    
    (context as? Activity)?.runOnUiThread {
        Toast.makeText(context, message, duration).show()
    }
}
```

#### 相机功能
```kotlin
private fun handleOpenCamera(params: JSONObject) {
    val activity = context as? ComponentActivity ?: return
    
    val intent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
    if (intent.resolveActivity(activity.packageManager) != null) {
        activity.startActivityForResult(intent, REQUEST_CAMERA)
    }
}
```

#### 位置获取
```kotlin
private fun handleGetLocation(params: JSONObject) {
    if (ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.ACCESS_FINE_LOCATION
        ) == PackageManager.PERMISSION_GRANTED
    ) {
        val locationManager = context.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        // 获取位置信息
    } else {
        // 请求位置权限
        ActivityCompat.requestPermissions(
            context as Activity,
            arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
            REQUEST_LOCATION_PERMISSION
        )
    }
}
```

#### 文件保存
```kotlin
private fun handleSaveToGallery(params: JSONObject) {
    val imageUrl = params.optString("imageUrl")
    val fileName = params.optString("fileName", "image_${System.currentTimeMillis()}.jpg")
    
    lifecycleScope.launch {
        try {
            val bitmap = downloadImage(imageUrl)
            saveImageToGallery(bitmap, fileName)
            
            callJavaScript("onNativeSuccess", JSONObject().apply {
                put("callbackId", params.optString("callbackId"))
                put("message", "图片保存成功")
            })
        } catch (e: Exception) {
            callJavaScript("onNativeError", JSONObject().apply {
                put("callbackId", params.optString("callbackId"))
                put("error", "图片保存失败: ${e.message}")
            })
        }
    }
}
```

## 数据层架构

### Repository模式

```kotlin
// UserRepository.kt
@Singleton
class UserRepository @Inject constructor(
    private val userApi: UserApi,
    private val userDao: UserDao,
    private val prefsManager: PrefsManager
) {
    
    suspend fun login(username: String, password: String): Result<User> {
        return try {
            val response = userApi.login(LoginRequest(username, password))
            if (response.isSuccessful) {
                val user = response.body()?.data
                user?.let {
                    userDao.insertUser(it.toEntity())
                    prefsManager.saveToken(response.body()?.token)
                }
                Result.success(user!!)
            } else {
                Result.failure(Exception(response.message()))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    fun getCurrentUser(): Flow<User?> {
        return userDao.getCurrentUser().map { it?.toDomain() }
    }
}
```

### Room数据库

```kotlin
// UserEntity.kt
@Entity(tableName = "users")
data class UserEntity(
    @PrimaryKey val id: String,
    val username: String,
    val email: String,
    val avatar: String?,
    val createdAt: Long,
    val updatedAt: Long
)

// UserDao.kt
@Dao
interface UserDao {
    @Query("SELECT * FROM users WHERE id = :userId")
    fun getUser(userId: String): Flow<UserEntity?>
    
    @Query("SELECT * FROM users LIMIT 1")
    fun getCurrentUser(): Flow<UserEntity?>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertUser(user: UserEntity)
    
    @Delete
    suspend fun deleteUser(user: UserEntity)
}

// AppDatabase.kt
@Database(
    entities = [UserEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun userDao(): UserDao
}
```

## ViewModel与状态管理

### WebViewViewModel

```kotlin
// WebViewViewModel.kt
@HiltViewModel
class WebViewViewModel @Inject constructor(
    private val userRepository: UserRepository,
    private val appRepository: AppRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(WebViewUiState())
    val uiState: StateFlow<WebViewUiState> = _uiState.asStateFlow()
    
    private var webView: WebView? = null
    
    data class WebViewUiState(
        val isLoading: Boolean = false,
        val currentUrl: String = "",
        val title: String = "",
        val canGoBack: Boolean = false,
        val canGoForward: Boolean = false,
        val showToolbar: Boolean = true,
        val shouldLoadUrl: Boolean = false,
        val error: String? = null
    )
    
    fun setWebView(webView: WebView) {
        this.webView = webView
    }
    
    fun loadUrl(url: String) {
        _uiState.update { it.copy(currentUrl = url, shouldLoadUrl = true) }
    }
    
    fun onUrlLoaded() {
        _uiState.update { it.copy(shouldLoadUrl = false) }
    }
    
    fun onPageStarted() {
        _uiState.update { it.copy(isLoading = true) }
    }
    
    fun onPageFinished(url: String) {
        _uiState.update { 
            it.copy(
                isLoading = false,
                currentUrl = url,
                canGoBack = webView?.canGoBack() ?: false,
                canGoForward = webView?.canGoForward() ?: false
            )
        }
    }
    
    fun onReceivedTitle(title: String) {
        _uiState.update { it.copy(title = title) }
    }
    
    fun executeJavaScript(script: String) {
        webView?.evaluateJavascript(script, null)
    }
    
    fun goBack() {
        webView?.goBack()
    }
    
    fun goForward() {
        webView?.goForward()
    }
    
    fun refresh() {
        webView?.reload()
    }
}
```

## 依赖注入配置

### Hilt模块

```kotlin
// AppModule.kt
@Module
@InstallIn(SingletonComponent::class)
object AppModule {
    
    @Provides
    @Singleton
    fun provideContext(@ApplicationContext context: Context): Context = context
    
    @Provides
    @Singleton
    fun providePrefsManager(@ApplicationContext context: Context): PrefsManager {
        return PrefsManager(context)
    }
    
    @Provides
    @Singleton
    fun provideAppConfig(): AppConfig {
        return AppConfig()
    }
}

// DatabaseModule.kt
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {
    
    @Provides
    @Singleton
    fun provideAppDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "workbench_database"
        ).build()
    }
    
    @Provides
    fun provideUserDao(database: AppDatabase): UserDao = database.userDao()
}

// NetworkModule.kt
@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {
    
    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        return OkHttpClient.Builder()
            .addInterceptor(HttpLoggingInterceptor().apply {
                level = if (BuildConfig.DEBUG) {
                    HttpLoggingInterceptor.Level.BODY
                } else {
                    HttpLoggingInterceptor.Level.NONE
                }
            })
            .addInterceptor(AuthInterceptor())
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }
    
    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
    }
    
    @Provides
    @Singleton
    fun provideUserApi(retrofit: Retrofit): UserApi = retrofit.create(UserApi::class.java)
}
```

## 权限管理

### AndroidManifest.xml权限声明

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    
    <!-- 网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- 相机权限 -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    
    <!-- 位置权限 -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- 其他权限 -->
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    
    <application
        android:name=".WorkbenchApplication"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/Theme.WorkbenchApp"
        android:usesCleartextTraffic="true">
        
        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:theme="@style/Theme.WorkbenchApp.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
        
        <activity
            android:name=".ui.webview.WebViewActivity"
            android:exported="false"
            android:theme="@style/Theme.WorkbenchApp.NoActionBar" />
            
    </application>
</manifest>
```

### 运行时权限处理

```kotlin
// PermissionUtils.kt
object PermissionUtils {
    
    fun requestCameraPermission(
        activity: ComponentActivity,
        onGranted: () -> Unit,
        onDenied: () -> Unit
    ) {
        when {
            ContextCompat.checkSelfPermission(
                activity,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED -> {
                onGranted()
            }
            ActivityCompat.shouldShowRequestPermissionRationale(
                activity,
                Manifest.permission.CAMERA
            ) -> {
                // 显示权限说明对话框
                showPermissionRationale(activity, "相机权限", "需要相机权限来拍摄照片") {
                    ActivityCompat.requestPermissions(
                        activity,
                        arrayOf(Manifest.permission.CAMERA),
                        REQUEST_CAMERA_PERMISSION
                    )
                }
            }
            else -> {
                ActivityCompat.requestPermissions(
                    activity,
                    arrayOf(Manifest.permission.CAMERA),
                    REQUEST_CAMERA_PERMISSION
                )
            }
        }
    }
}
```

## 构建配置

### build.gradle.kts (app模块)

```kotlin
plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("dagger.hilt.android.plugin")
    id("kotlin-parcelize")
}

android {
    namespace = "com.workbench.mobile"
    compileSdk = 34
    
    defaultConfig {
        applicationId = "com.workbench.mobile"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0.0"
        
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }
    
    buildTypes {
        debug {
            isDebuggable = true
            buildConfigField("String", "API_BASE_URL", "\"http://192.168.1.100:3001\"")
            buildConfigField("String", "H5_BASE_URL", "\"http://192.168.1.100:8000\"")
        }
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            buildConfigField("String", "API_BASE_URL", "\"https://api.example.com\"")
            buildConfigField("String", "H5_BASE_URL", "\"https://app.example.com\"")
        }
    }
    
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_1_8
        targetCompatibility = JavaVersion.VERSION_1_8
    }
    
    kotlinOptions {
        jvmTarget = "1.8"
    }
    
    buildFeatures {
        compose = true
        buildConfig = true
    }
    
    composeOptions {
        kotlinCompilerExtensionVersion = "1.5.4"
    }
    
    packaging {
        resources {
            excludes += "/META-INF/{AL2.0,LGPL2.1}"
        }
    }
}

dependencies {
    // Android Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Compose
    implementation(platform("androidx.compose:compose-bom:2023.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    
    // ViewModel
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    
    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.6")
    
    // Hilt
    implementation("com.google.dagger:hilt-android:2.48")
    kapt("com.google.dagger:hilt-compiler:2.48")
    implementation("androidx.hilt:hilt-navigation-compose:1.1.0")
    
    // Network
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0")
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")
    
    // Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    
    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")
    
    // Permissions
    implementation("com.google.accompanist:accompanist-permissions:0.32.0")
    
    // WebView
    implementation("androidx.webkit:webkit:1.9.0")
    
    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
    androidTestImplementation(platform("androidx.compose:compose-bom:2023.10.01"))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}
```

## 性能优化

### WebView优化

```kotlin
// WebView性能优化
private fun optimizeWebView(webView: WebView) {
    webView.settings.apply {
        // 启用硬件加速
        setLayerType(View.LAYER_TYPE_HARDWARE, null)
        
        // 缓存策略
        cacheMode = WebSettings.LOAD_DEFAULT
        
        // 禁用不必要的功能
        setGeolocationEnabled(false)
        allowFileAccessFromFileURLs = false
        allowUniversalAccessFromFileURLs = false
        
        // 字体大小
        textZoom = 100
    }
    
    // 预加载常用资源
    webView.loadUrl("javascript:void(0)")
}
```

### 内存优化

```kotlin
// 内存泄漏防护
override fun onDestroy() {
    super.onDestroy()
    
    webView?.apply {
        loadDataWithBaseURL(null, "", "text/html", "utf-8", null)
        clearHistory()
        removeAllViews()
        destroy()
    }
    webView = null
}
```

## 测试

### 单元测试

```kotlin
// UserRepositoryTest.kt
@ExperimentalCoroutinesApi
class UserRepositoryTest {
    
    @get:Rule
    val coroutineRule = MainCoroutineRule()
    
    @Mock
    private lateinit var userApi: UserApi
    
    @Mock
    private lateinit var userDao: UserDao
    
    @Mock
    private lateinit var prefsManager: PrefsManager
    
    private lateinit var repository: UserRepository
    
    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        repository = UserRepository(userApi, userDao, prefsManager)
    }
    
    @Test
    fun `login success returns user`() = runTest {
        // Given
        val loginRequest = LoginRequest("username", "password")
        val user = User("1", "username", "email@example.com")
        val response = ApiResponse.success(user, "token")
        
        whenever(userApi.login(loginRequest)).thenReturn(Response.success(response))
        
        // When
        val result = repository.login("username", "password")
        
        // Then
        assertTrue(result.isSuccess)
        assertEquals(user, result.getOrNull())
    }
}
```

### UI测试

```kotlin
// WebViewActivityTest.kt
@RunWith(AndroidJUnit4::class)
class WebViewActivityTest {
    
    @get:Rule
    val composeTestRule = createComposeRule()
    
    @Test
    fun webViewLoadsCorrectly() {
        composeTestRule.setContent {
            WorkbenchTheme {
                WebViewScreen(
                    viewModel = WebViewViewModel(),
                    onNavigateBack = {}
                )
            }
        }
        
        // 验证WebView存在
        composeTestRule.onNodeWithTag("webview").assertExists()
    }
}
```

## 部署与发布

### 签名配置

```kotlin
// build.gradle.kts (app模块)
android {
    signingConfigs {
        create("release") {
            storeFile = file("../keystore/release.keystore")
            storePassword = "your_store_password"
            keyAlias = "your_key_alias"
            keyPassword = "your_key_password"
        }
    }
    
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            // ...
        }
    }
}
```

### 混淆配置

```proguard
# proguard-rules.pro

# 保持WebView JavaScript接口
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# 保持Retrofit接口
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class retrofit2.Response
-keep,allowobfuscation,allowshrinking class kotlin.coroutines.Continuation

# 保持数据类
-keep class com.workbench.mobile.data.model.** { *; }
-keep class com.workbench.mobile.data.remote.dto.** { *; }

# Hilt
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keep class * extends dagger.hilt.android.AndroidEntryPoint
```

## 故障排除

### 常见问题

1. **WebView显示空白**
   - 检查网络权限
   - 确认URL可访问
   - 查看控制台日志

2. **JavaScript Bridge不工作**
   - 确认JavascriptInterface注解
   - 检查方法名称大小写
   - 验证参数格式

3. **权限申请失败**
   - 检查manifest声明
   - 确认targetSdk版本
   - 测试权限申请流程

4. **应用崩溃**
   - 查看Logcat日志
   - 检查内存泄漏
   - 使用调试工具分析

### 调试工具

- Android Studio Debugger
- Logcat
- Chrome DevTools (WebView调试)
- Layout Inspector
- Memory Profiler

## 许可证

MIT License
