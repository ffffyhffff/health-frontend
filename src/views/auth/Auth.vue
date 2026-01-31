<template>
  <div class="auth">
    <div class="bg">
      <span class="motion"></span>
      <span class="orb orb--1"></span>
      <span class="orb orb--2"></span>
      <span class="orb orb--3"></span>
      <span class="glow glow--top"></span>
      <span class="glow glow--bottom"></span>
    </div>
    <div class="container" :class="{ 'is-register': isRegister }">
      <!-- Register Panel (Left) -->
      <section class="panel panel--register">
        <header class="panel__header">
          <el-icon class="panel__icon" color="#10b981" :size="24"><Avatar /></el-icon>
          <h2 class="panel__title">注册账户</h2>
          <p class="panel__desc">加入个人健康系统，开始记录健康数据</p>
        </header>
        <el-form ref="regRef" :model="regForm" :rules="regRules" label-position="top" @keyup.enter="onRegister">
          <el-form-item label="用户名" prop="username">
            <el-input v-model="regForm.username" size="large" clearable placeholder="请输入用户名" :prefix-icon="UserFilled" />
          </el-form-item>
          <el-form-item label="账号" prop="account">
            <el-input v-model="regForm.account" size="large" clearable placeholder="用于登录的账号" :prefix-icon="Avatar" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="regForm.password" size="large" type="password" show-password placeholder="至少 6 位" :prefix-icon="Key" />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirm">
            <el-input v-model="regForm.confirm" size="large" type="password" show-password placeholder="再次输入密码" :prefix-icon="Check" />
          </el-form-item>
          <div class="row between">
            <el-checkbox v-model="regForm.agree">同意服务协议与隐私政策</el-checkbox>
          </div>
          <el-button class="btn" type="success" size="large" round :loading="loadingReg" @click="onRegister">注 册</el-button>
          <div class="hint">
            已有账号？<el-link type="primary" :underline="false" @click="goLogin">去登录</el-link>
          </div>
        </el-form>
      </section>

      <!-- Login Panel (Right) -->
      <section class="panel panel--login">
        <header class="panel__header">
          <el-icon class="panel__icon" color="#6366f1" :size="24"><UserFilled /></el-icon>
          <h2 class="panel__title">登录</h2>
          <p class="panel__desc">欢迎回来，继续您的健康旅程</p>
        </header>
        <el-form ref="loginRef" :model="loginForm" :rules="loginRules" label-position="top" @keyup.enter="onLogin">
          <el-form-item label="账号" prop="account">
            <el-input v-model="loginForm.account" size="large" clearable placeholder="用户名 / 手机号" :prefix-icon="UserFilled" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="loginForm.password" size="large" type="password" show-password placeholder="请输入密码" :prefix-icon="Key" />
          </el-form-item>
          <div class="row between">
            <el-checkbox v-model="loginForm.remember">记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
          <el-button class="btn" type="primary" size="large" round :loading="loadingLogin" @click="onLogin">登 录</el-button>
          <div class="hint">
            还没有账号？<el-link type="primary" :underline="false" @click="goRegister">去注册</el-link>
          </div>
        </el-form>
      </section>

      <!-- Sliding Switcher -->
      <div class="switcher">
        <div class="switcher__inner">
          <div class="switcher__content" v-if="!isRegister">
            <h3>新用户？</h3>
            <p>注册即可获得个性化食谱、健康咨询与记录功能。</p>
            <el-button size="large" type="success" plain round @click="goRegister">去注册</el-button>
          </div>
          <div class="switcher__content" v-else>
            <h3>已有账号？</h3>
            <p>登录并同步您的健康记录与计划。</p>
            <el-button size="large" type="primary" plain round @click="goLogin">去登录</el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { UserFilled, Key, Check, Avatar } from "@element-plus/icons-vue";

const route = useRoute();
const router = useRouter();

// 用 computed 直接根据路由实时判断，避免初始不同步
const isRegister = computed(() => route.name === "register" || route.path === "/register");

// Login form
const loginRef = ref();
const loadingLogin = ref(false);
const loginForm = reactive({ account: "", password: "", remember: true });
const loginRules = {
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, message: "账号至少 3 个字符", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" },
  ],
};

const onLogin = () => {
  loginRef.value?.validate(async (ok) => {
    if (!ok) return;
    try {
      loadingLogin.value = true;
      
      // 检查是否为管理员账号
      if (loginForm.account === 'admin') {
        // 管理员登录 - 使用后端 API
        const { adminLogin } = await import('@/api');
        const data = await adminLogin({
          account: loginForm.account,
          password: loginForm.password
        });
        
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify(data.adminInfo));
        ElMessage.success('管理员登录成功');
        router.push('/admin/dashboard');
      } else {
        // 普通用户登录 - 使用后端 API
        const { login } = await import('@/api');
        const data = await login({
          account: loginForm.account,
          password: loginForm.password
        });
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userInfo.id);
        localStorage.setItem('userInfo', JSON.stringify(data.userInfo));
        
        ElMessage.success('登录成功');
        router.push('/app');
      }
    } catch (error) {
      console.error('登录失败:', error);
      ElMessage.error('登录失败: ' + (error.message || '请检查账号和密码'));
    } finally {
      loadingLogin.value = false;
    }
  });
};

// Register form
const regRef = ref();
const loadingReg = ref(false);
const regForm = reactive({ username: "", account: "", password: "", confirm: "", agree: false });
const validateConfirm = (rule, val, cb) => {
  if (!val) return cb(new Error("请再次输入密码"));
  if (val !== regForm.password) return cb(new Error("两次输入的密码不一致"));
  cb();
};
const regRules = {
  username: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "用户名 2-20 个字符", trigger: "blur" },
  ],
  account: [
    { required: true, message: "请输入账号", trigger: "blur" },
    { min: 3, max: 20, message: "账号 3-20 个字符", trigger: "blur" },
    { pattern: /^[a-zA-Z0-9_]+$/, message: "只能包含字母、数字和下划线", trigger: "blur" },
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码至少 6 位", trigger: "blur" },
  ],
  confirm: [{ validator: validateConfirm, trigger: ["blur", "change"] }],
};

const onRegister = () => {
  regRef.value?.validate(async (ok) => {
    if (!ok) return;
    if (!regForm.agree) {
      ElMessage.warning("请先勾选同意服务协议与隐私政策");
      return;
    }
    try {
      loadingReg.value = true;
      
      // 调用后端注册 API
      const { register } = await import('@/api');
      await register({
        username: regForm.username,
        account: regForm.account,
        password: regForm.password,
        confirm: regForm.confirm  // 添加 confirm 字段
      });
      
      ElMessage.success("注册成功，前往登录");
      goLogin();
    } catch (error) {
      console.error('注册失败:', error);
      ElMessage.error('注册失败: ' + (error.message || '请检查输入信息'));
    } finally {
      loadingReg.value = false;
    }
  });
};

// Toggle helpers
const goRegister = () => router.push({ name: "register" });
const goLogin = () => router.push({ name: "login" });
</script>

<style scoped>
.auth {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #f0f9ff 0%, #ecfeff 40%, #faf5ff 100%);
  overflow: hidden;
}

.bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(1200px 600px at 10% 15%, rgba(99,102,241,0.25), transparent 60%),
    radial-gradient(1000px 520px at 85% 85%, rgba(16,185,129,0.22), transparent 60%),
    linear-gradient(135deg, #eef2ff 0%, #f0fdf4 60%, #fff7ed 100%);
}
.motion {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 0% 0%, rgba(99,102,241,0.14), transparent 45%),
              radial-gradient(circle at 100% 100%, rgba(16,185,129,0.14), transparent 45%);
  background-size: 220% 220%;
  animation: bgShift 26s ease-in-out infinite alternate, bgHue 52s linear infinite;
  pointer-events: none;
  will-change: background-position, filter;
}
.bg::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  display: none; /* 移除点阵覆盖层 */
}

/* orbs */
.orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(32px) saturate(1.2);
  opacity: 0.85;
  will-change: transform;
}
.orb--1 {
  width: 520px; height: 520px;
  left: -140px; top: -120px;
  background: radial-gradient(circle at 30% 30%, rgba(99,102,241,0.38), rgba(99,102,241,0.08) 60%, transparent 70%);
  animation: floatOne 18s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: -2s;
}
.orb--2 {
  width: 420px; height: 420px;
  right: -120px; bottom: -80px;
  background: radial-gradient(circle at 70% 70%, rgba(16,185,129,0.32), rgba(16,185,129,0.08) 60%, transparent 70%);
  animation: floatTwo 24s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: -4s;
}
.orb--3 {
  width: 320px; height: 320px;
  left: 50%; top: 65%; transform: translate(-50%, -50%);
  background: radial-gradient(circle at 50% 50%, rgba(14,165,233,0.28), rgba(14,165,233,0.06) 60%, transparent 72%);
  animation: floatThree 20s cubic-bezier(0.45, 0, 0.55, 1) infinite;
  animation-delay: -1.2s;
}

/* soft glows */
.glow {
  position: absolute;
  pointer-events: none;
  filter: blur(20px);
  animation: glowPulse 16s ease-in-out infinite alternate;
}
.glow--top {
  inset: 0 0 60% 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.35), transparent 60%);
}
.glow--bottom {
  inset: 60% 0 0 0;
  background: linear-gradient(0deg, rgba(255, 237, 213, 0.25), transparent 60%);
}

.container {
  position: relative;
  width: min(92vw, 980px);
  height: 620px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 20px 70px rgba(18, 43, 70, 0.12);
  overflow: hidden;
  display: grid;
  grid-template-columns: 1fr 1fr;
  z-index: 1;
}

.panel {
  padding: 24px 28px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: translateX(0) translateZ(0);
  opacity: 1;
  filter: blur(0px);
  transition:
    transform 680ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 520ms ease,
    filter 680ms ease;
  will-change: transform, opacity, filter;
  backface-visibility: hidden;
  overflow-y: auto;
  max-height: 620px;
}
.panel__header { text-align: left; margin-bottom: 4px; }
.panel__icon { vertical-align: middle; }
.panel__title { margin: 4px 0 2px; font-size: 20px; font-weight: 700; color: #0f172a; }
.panel__desc { margin: 0 0 6px; font-size: 12px; color: #475569; }

.panel--register { grid-column: 1; }
.panel--login { grid-column: 2; }

.btn { width: 100%; margin-top: 8px; }
.row { display: flex; align-items: center; gap: 8px; }
.between { justify-content: space-between; margin: 6px 0 12px; }
.hint { text-align: center; margin-top: 12px; color: #64748b; font-size: 13px; }

/* Sliding switcher */
.switcher {
  position: absolute;
  top: 0; bottom: 0;
  width: 50%;
  left: 0;
  transform: translateX(100%);
  transition: transform 520ms ease;
  pointer-events: auto;
}
.switcher__inner {
  position: absolute; inset: 0;
  padding: 32px;
  display: grid; place-items: center;
  background: radial-gradient(600px 300px at 20% 20%, rgba(99,102,241,0.18), transparent),
    radial-gradient(600px 300px at 80% 80%, rgba(16,185,129,0.18), transparent),
    linear-gradient(135deg, #eef2ff 0%, #f0fdf4 100%);
}
.switcher__content { text-align: center; max-width: 340px; }
.switcher__content h3 { margin: 0 0 6px; font-size: 20px; color: #0f172a; }
.switcher__content p { margin: 0 0 14px; font-size: 13px; color: #475569; }

/* States: show only the active panel; hide the inactive one */
.container:not(.is-register) .panel--register {
  opacity: 0;
  transform: translateX(-24px) translateZ(0);
  pointer-events: none;
  user-select: none;
  filter: blur(6px);
}
.container.is-register .panel--login {
  opacity: 0;
  transform: translateX(24px) translateZ(0);
  pointer-events: none;
  user-select: none;
  filter: blur(6px);
}

/* Position the switcher over the inactive side */
.container.is-register .switcher { transform: translateX(100%); }
.container:not(.is-register) .switcher { transform: translateX(0%); }

@media (max-width: 880px) {
  .container { height: auto; grid-template-columns: 1fr; }
  .panel { padding: 22px; }
  .panel--register, .panel--login { grid-column: 1; }
  .switcher { display: none; }
}

@keyframes floatOne {
  0%   { transform: translate3d(0,0,0) scale(1); }
  50%  { transform: translate3d(40px,28px,0) scale(1.035); }
  100% { transform: translate3d(0,0,0) scale(1); }
}
@keyframes floatTwo {
  0%   { transform: translate3d(0,0,0) scale(1); }
  50%  { transform: translate3d(-44px,-28px,0) scale(1.03); }
  100% { transform: translate3d(0,0,0) scale(1); }
}
@keyframes floatThree {
  0%   { transform: translate(-50%,-50%) scale(1); }
  50%  { transform: translate(calc(-50% + 20px), calc(-50% - 18px)) scale(1.025); }
  100% { transform: translate(-50%,-50%) scale(1); }
}
@keyframes bgHue {
  0% { filter: hue-rotate(0deg); }
  100% { filter: hue-rotate(28deg); }
}
@keyframes bgShift {
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
}
@keyframes gridDrift {
  0% { background-position: 0 0; }
  100% { background-position: 200px 140px; }
}
@keyframes glowPulse {
  0% { opacity: 0.65; }
  50% { opacity: 0.9; }
  100% { opacity: 0.7; }
}

@media (prefers-reduced-motion: reduce) {
  .motion, .orb, .glow { animation: none !important; }
  .panel { transition: none; }
}
</style>
