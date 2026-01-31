<template>
  <div class="page">
    <el-card class="chat-card">
      <template #header>
        <div class="header-title">
          <el-icon><ChatDotRound /></el-icon>
          <span>健康咨询</span>
        </div>
      </template>
      
      <div class="chat-container">
        <div class="chat-messages" ref="messagesContainer">
          <div v-for="msg in messages" :key="msg.id" :class="['message', msg.role]">
            <div class="message-avatar">
              <el-avatar :size="36" :src="msg.role === 'user' ? userAvatar : ''">
                <el-icon><Service /></el-icon>
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="message-text" v-if="msg.role === 'user'">{{ msg.content }}</div>
              <div class="message-text markdown" v-else v-html="renderContent(msg)"></div>
              <div class="message-time">{{ msg.time }}</div>
            </div>
          </div>
          <div v-if="isTyping" class="message assistant">
            <div class="message-avatar">
              <el-avatar :size="36">
                <el-icon><Service /></el-icon>
              </el-avatar>
            </div>
            <div class="message-content">
              <div class="typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="chat-input-area">
          <el-input
            v-model="inputMessage"
            :rows="2"
            type="textarea"
            placeholder="请输入您的健康问题，例如：如何改善睡眠质量？"
            @keydown.enter.prevent="handleSend"
          />
          <el-button type="primary" :icon="Position" @click="handleSend" :disabled="!inputMessage.trim()">发送</el-button>
        </div>
        
        <div class="quick-questions">
          <div class="quick-title">快捷问题：</div>
          <el-tag v-for="q in quickQuestions" :key="q" @click="selectQuick(q)" class="quick-tag">{{ q }}</el-tag>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, nextTick, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github-dark.css'
import { ChatDotRound, Position, Service } from '@element-plus/icons-vue'
import { getConsultHistory, openConsultStream } from '@/api'
import { ElMessage } from 'element-plus'

const messagesContainer = ref(null)
const inputMessage = ref('')
const isTyping = ref(false)
const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
const userAvatar = userInfo && userInfo.avatar ? userInfo.avatar : ''

const messages = ref([])

const quickQuestions = [
  '如何改善睡眠质量？',
  '每日推荐运动量是多少？',
  '健康饮食的基本原则？',
  'BMI 指标怎么计算？'
]

function createMessage(data) {
  return reactive({
    id: data.id ?? Date.now(),
    role: data.role ?? 'assistant',
    content: data.content ?? '',
    time: data.time ?? formatTime(new Date())
  })
}

function pushMessage(data) {
  const msg = createMessage(data)
  messages.value.push(msg)
  return msg
}

if (messages.value.length === 0) {
  pushMessage({
    id: 1,
    role: 'assistant',
    content: '你好，我是你的健康咨询助手，可以为你解答健康、饮食、运动等方面的问题。请问有什么可以帮助你的吗？',
    time: formatTime(new Date())
  })
}


let activeStreamController = null
let typingTarget = null
let sessionId = (crypto && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now())

function stopActiveStream() {
  if (activeStreamController) {
    activeStreamController.abort()
    activeStreamController = null
  }
  finishTyping({ flush: true })
}

onUnmounted(() => {
  stopActiveStream()
})

// 加载历史记录
onMounted(async () => {
  try {
    const data = await getConsultHistory({ current: 1, pageSize: 20 })
    if (data && data.records && data.records.length > 0) {
      // 清空默认消息
      messages.value.splice(0, messages.value.length)
      
      // 添加历史消息
      data.records.forEach(record => {
        pushMessage({
          id: record.id,
          role: 'user',
          content: record.question,
          time: formatTime(new Date(record.createdTime))
        })
        pushMessage({
          id: `${record.id}-reply`,
          role: 'assistant',
          content: record.answer,
          time: formatTime(new Date(record.createdTime))
        })
      })
      
      scrollToBottom()
    }
  } catch (error) {
    console.error('加载历史记录失败:', error)
  }
})

let md
try {
  md = new MarkdownIt({
    html: false,
    linkify: true,
    breaks: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try { return hljs.highlight(str, { language: lang }).value } catch (__) {}
      }
      return ''
    }
  })
} catch (e) {
  md = new MarkdownIt()
}

const renderContent = (msg) => {
  try {
    return md.render(String(msg.content || ''))
  } catch (e) {
    return String(msg.content || '')
  }
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0')
  const m = String(date.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

function selectQuick(question) {
  inputMessage.value = question
  handleSend()
}

async function handleSend() {
  const text = inputMessage.value.trim()
  if (!text) return
  
  pushMessage({
    id: Date.now(),
    role: 'user',
    content: text,
    time: formatTime(new Date())
  })
  
  inputMessage.value = ''
  scrollToBottom()
  
  isTyping.value = true
  stopActiveStream()
  const assistantMsg = pushMessage({
    id: Date.now(),
    role: 'assistant',
    content: '',
    time: formatTime(new Date())
  })
  setTypingTarget(assistantMsg)
  scrollToBottom()

  const controller = new AbortController()
  activeStreamController = controller

  try {
    await streamConsultAnswer(text, assistantMsg, controller)
  } catch (error) {
    if (error?.name === 'AbortError') {
      return
    }
    console.error('咨询失败:', error)
    ElMessage.error(`咨询失败: ${error?.message || '未知错误'}`)
    isTyping.value = false
    finishTyping({ flush: true })
    assistantMsg.content = assistantMsg.content || '抱歉，系统出现了一些问题，请稍后再试。'
    scrollToBottom()
  } finally {
    if (activeStreamController === controller) {
      activeStreamController = null
    }
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

async function streamConsultAnswer(question, assistantMsg, controller) {
  const response = await openConsultStream(question, sessionId, controller)

  if (!response.ok) {
    throw new Error('AI 数据流中断')
  }
  if (!response.body || !response.body.getReader) {
    throw new Error('当前浏览器不支持流式传输')
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder('utf-8')

  await new Promise((resolve, reject) => {
    let buffer = ''
    let settled = false

    const finalize = (cb) => {
      if (settled) return
      settled = true
      finishTyping({ flush: true })
      isTyping.value = false
      try {
        if (reader.releaseLock) reader.releaseLock()
      } catch (_) {}
      if (typeof cb === 'function') cb()
    }

    const handleEvent = (eventName, payload) => {
      if (eventName === 'message') {
        enqueueTypingChunk(payload)
      } else if (eventName === 'end') {
        finalize(() => resolve())
      } else if (eventName === 'error') {
        finalize(() => reject(new Error(payload || 'AI 流式服务异常')))
      }
    }

    const pump = () => {
      reader.read()
        .then(({ value, done }) => {
          if (done) {
            parseSseBuffer(buffer, handleEvent, true)
            finalize(() => resolve())
            return
          }
          buffer += decoder.decode(value, { stream: true })
          buffer = parseSseBuffer(buffer, handleEvent)
          pump()
        })
        .catch(err => {
          finalize(() => reject(err))
        })
    }

    pump()
  })
}
function parseSseBuffer(buffer, onEvent, flush = false) {
  let working = buffer.replace(/\r/g, '')
  let delimiterIndex = working.indexOf('\n\n')

  while (delimiterIndex !== -1) {
    const rawEvent = working.slice(0, delimiterIndex).trim()
    working = working.slice(delimiterIndex + 2)
    if (rawEvent) {
      dispatchSseEvent(rawEvent, onEvent)
    }
    delimiterIndex = working.indexOf('\n\n')
  }

  if (flush && working.trim()) {
    dispatchSseEvent(working.trim(), onEvent)
    working = ''
  }

  return working
}

function dispatchSseEvent(rawEvent, onEvent) {
  if (!rawEvent) return
  const lines = rawEvent.split('\n')
  let eventName = 'message'
  const dataLines = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    if (trimmed.startsWith('event:')) {
      eventName = trimmed.slice(6).trim() || 'message'
    } else if (trimmed.startsWith('data:')) {
      dataLines.push(trimmed.slice(5))
    }
  }

  const payload = dataLines.join('\n')
  onEvent(eventName, payload)
}

function setTypingTarget(target) {
  finishTyping({ flush: true })
  typingTarget = target
}

function enqueueTypingChunk(text) {
  if (!typingTarget || !text) return
  typingTarget.content += text
  scrollToBottom()
}

function finishTyping({ flush = false } = {}) {
  typingTarget = null
}
</script>


<style scoped>
.page { padding: 16px; height: calc(100vh - 88px); }
.chat-card { height: 100%; display: flex; flex-direction: column; }
.chat-card :deep(.el-card__body) { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

.header-title { display: flex; align-items: center; gap: 8px; font-weight: 600; }

.chat-container { flex: 1; display: flex; flex-direction: column; height: 100%; }

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  margin-bottom: 16px;
}

.message {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.message.user {
  flex-direction: row-reverse;
}

.message-avatar {
  flex-shrink: 0;
}

.message.user .message-avatar :deep(.el-avatar) {
  background: #16a34a;
}

.message.assistant .message-avatar :deep(.el-avatar) {
  background: #6366f1;
}

.message-content {
  max-width: 70%;
}

.message-text {
  background: white;
  padding: 12px 16px;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  white-space: pre-line;
  line-height: 1.6;
}

.markdown :deep(pre), .markdown :deep(code) { background: #0f172a; color: #e5e7eb; }
.markdown :deep(pre) { padding: 12px; border-radius: 8px; overflow: auto; }
.markdown :deep(code) { padding: 2px 6px; border-radius: 6px; }
.markdown :deep(h1), .markdown :deep(h2), .markdown :deep(h3) { margin: 10px 0 6px; }
.markdown :deep(ul) { padding-left: 20px; }

.message.user .message-text {
  background: #16a34a;
  color: white;
}

.message-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 4px;
  padding: 0 4px;
}

.message.user .message-time {
  text-align: right;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #94a3b8;
  animation: typing 1.4s infinite;
}

.typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing {
  0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
  30% { opacity: 1; transform: translateY(-8px); }
}

.chat-input-area {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  margin-bottom: 12px;
}

.chat-input-area .el-input {
  flex: 1;
}

.quick-questions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.quick-title {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.quick-tag {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-tag:hover {
  background: #16a34a;
  color: white;
  border-color: #16a34a;
}
</style>



