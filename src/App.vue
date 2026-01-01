<template>
  <div v-if="!isLoggedIn" class="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-6 relative">
    <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black/5 pointer-events-none"></div>
    <div class="max-w-md w-full z-10 space-y-8 p-10 rounded-2xl bg-white border border-slate-300 shadow-2xl text-center">
      <div class="space-y-2">
        <h1 class="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">MonoTask</h1>
        <p class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.3em]">Focus on your ToDo</p>
        
        <div class="flex justify-center gap-4 mt-8 p-1 bg-slate-100 rounded-xl">
          <button @click="isLoginMode = true" class="flex-1 py-2 rounded-lg text-xs font-black transition-all" :class="isLoginMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'">LOGIN</button>
          <button @click="isLoginMode = false" class="flex-1 py-2 rounded-lg text-xs font-black transition-all" :class="!isLoginMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'">SIGN UP</button>
        </div>
      </div>

      <div class="space-y-4 text-left">
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">User ID</label>
          <input v-model="authForm.username" type="text" class="auth-input" placeholder="Your name" />
        </div>
        <div class="space-y-1">
          <label class="text-[10px] font-black text-slate-500 uppercase ml-2 tracking-widest">Passcode</label>
          <input v-model="authForm.password" type="password" @keyup.enter="handleAuthAction" class="auth-input" placeholder="••••••••" />
        </div>
      </div>

      <button @click="handleAuthAction" class="w-full bg-slate-800 hover:bg-slate-900 text-white font-black py-5 rounded-xl transition-all shadow-lg active:scale-95 uppercase tracking-widest text-sm">
        {{ isLoginMode ? 'Enter Hub' : 'Create Account' }}
      </button>
      <p v-if="authError" class="text-red-600 text-xs font-black animate-pulse uppercase">{{ authError }}</p>
    </div>
  </div>

  <div v-else class="flex flex-col md:flex-row min-h-screen bg-[#ecebe4] text-slate-800 font-sans selection:bg-indigo-100 h-screen overflow-hidden">
    
    <header class="md:hidden flex items-center justify-between p-4 bg-[#f9f8f3] border-b border-slate-300 shrink-0 z-30">
      <h1 class="text-xl font-black text-slate-800 tracking-tighter italic leading-none">MONOTASK</h1>
      <button @click="isSidebarOpen = !isSidebarOpen" class="p-2 text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
        <svg v-if="!isSidebarOpen" class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        <svg v-else class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
    </header>

    <aside 
      class="fixed inset-y-0 left-0 w-80 bg-[#f9f8f3] border-r border-slate-300 p-8 pb-12 flex flex-col gap-6 z-40 transform transition-transform duration-300 ease-in-out md:relative md:transform-none md:translate-x-0 shadow-2xl md:shadow-none overflow-y-auto"
      :class="isSidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    >
      <div class="flex flex-col gap-1 mt-8 md:mt-0 shrink-0">
        <h1 class="text-2xl font-black text-slate-800 tracking-tighter italic leading-none hidden md:block">MONOTASK</h1>
        <div class="flex items-center gap-3 mt-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div class="bg-indigo-600 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-md shrink-0">
            {{ currentUser.charAt(0).toUpperCase() }}
          </div>
          <div class="flex flex-col overflow-hidden">
            <p class="text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none mb-0.5">Logged in as</p>
            <p class="text-xs text-slate-700 font-black uppercase truncate tracking-tight">{{ currentUser }}</p>
          </div>
        </div>
      </div>

      <div class="calendar-container bg-white p-4 rounded-xl border border-slate-200 shadow-sm shrink-0">
        <div class="flex items-center justify-between mb-2 px-1">
          <h2 class="text-xs font-black text-slate-700 uppercase">{{ currentMonthName }} {{ currentYear }}</h2>
          <div class="flex gap-2">
            <button @click="prevMonth" class="p-1 hover:bg-slate-100 rounded text-slate-400 transition">←</button>
            <button @click="nextMonth" class="p-1 hover:bg-slate-100 rounded text-slate-400 transition">→</button>
          </div>
        </div>

        <button @click="goToToday" class="mx-auto block mb-4 px-4 py-1 border border-slate-200 rounded-lg text-[9px] font-black text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-all uppercase tracking-[0.1em]">Today</button>

        <div class="grid grid-cols-7 text-center text-[10px] font-black text-slate-300 mb-2">
          <div v-for="d in ['S','M','T','W','T','F','S']" :key="d">{{ d }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1">
          <div v-for="n in calendarPadding" :key="'pad-'+n"></div>
          <button v-for="day in daysInMonth" :key="day" @click="selectedDate = formatDate(currentYear, currentMonth, day); isSidebarOpen = false" class="h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all" :class="isDateSelected(day) ? 'bg-indigo-600 text-white shadow-md scale-110' : 'hover:bg-slate-100 text-slate-600'">
            {{ day }}
          </button>
        </div>
      </div>

      <div class="mt-auto space-y-4 shrink-0">
        <div class="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm text-slate-600 text-[11px] leading-relaxed italic">
          "The best way to predict your future is to create it."
        </div>
        <button @click="logout" class="w-full flex items-center justify-center gap-3 bg-white border border-slate-300 hover:bg-red-50 hover:text-red-600 text-slate-400 font-black py-4 rounded-xl transition-all uppercase text-[10px] tracking-widest shadow-sm">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Sign Out Hub
        </button>
      </div>
    </aside>

    <div v-if="isSidebarOpen" @click="isSidebarOpen = false" class="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"></div>

    <main ref="mainContent" class="flex-1 p-4 md:p-12 overflow-y-auto w-full">
      
      <section class="mb-4 md:mb-12">
        <draggable 
          v-model="focusList" 
          group="tasks" 
          item-key="id" 
          class="rounded-[2rem] md:rounded-[3rem] border-4 border-dashed border-slate-300 flex items-center justify-center p-4 md:p-8 transition-all duration-700 relative overflow-hidden" 
          :class="focusList.length > 0 ? 'min-h-[350px] md:min-h-[450px] bg-slate-900 border-none shadow-2xl' : 'hidden md:flex min-h-[180px] bg-slate-200/50'"
        >
          <template #item="{ element }">
            <div class="w-full max-w-3xl text-center space-y-6 md:space-y-12 z-20 text-white relative">
              
              <div class="absolute top-6 left-6 md:top-12 md:left-12 animate-float opacity-80 pointer-events-none">
                <svg class="w-10 h-10 md:w-[60px] md:h-[60px]" viewBox="0 0 24 24" fill="none"><path d="M12 2V6M12 6C8.686 6 6 8.686 6 12V22H18V12C18 8.686 15.314 6 12 6Z" :stroke="element.isPaused ? '#f59e0b' : '#818cf8'" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="12" r="2" :fill="element.isPaused ? '#f59e0b' : '#818cf8'"/></svg>
                <div class="text-[6px] md:text-[8px] font-black mt-2 tracking-widest uppercase" :class="element.isPaused ? 'text-amber-500 animate-pulse' : 'text-indigo-400'">
                  {{ element.isPaused ? 'Mission Paused' : 'System Active' }}
                </div>
              </div>

              <div class="relative flex items-center justify-center py-4 md:py-10">
                <svg class="absolute w-[20rem] h-[20rem] md:w-[30rem] md:h-[30rem] pointer-events-none opacity-20" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="white" stroke-width="0.5" fill="none" />
                  <circle cx="50" cy="10" r="1.5" :fill="element.isPaused ? '#f59e0b' : '#818cf8'" class="transition-transform duration-1000 ease-linear" :style="{ transform: `rotate(${seconds * 6}deg)`, transformOrigin: '50px 50px' }" />
                </svg>
                <div class="timer-display font-mono text-6xl md:text-[10rem] font-black tracking-tighter drop-shadow-2xl leading-none relative z-10 transition-all duration-500" :class="element.isPaused ? 'opacity-30 scale-95 blur-[1px]' : 'opacity-100 scale-100'">
                  {{ elapsedTime }}
                </div>
              </div>

              <div class="space-y-2 md:space-y-4">
                <textarea v-model="element.text" @change="saveTodos(todos)" rows="1" class="bg-transparent border-none text-center text-3xl md:text-5xl font-black w-full focus:ring-0 resize-none leading-tight overflow-hidden"></textarea>
                <textarea v-model="element.notes" @change="saveTodos(todos)" placeholder="Mission details..." class="bg-white/5 border border-white/10 rounded-xl md:rounded-2xl p-4 md:p-6 w-full text-center text-slate-300 text-sm md:text-lg focus:ring-2 focus:ring-indigo-500/30 outline-none h-20 md:h-28 resize-none transition-all"></textarea>
              </div>

              <div class="flex flex-col items-center justify-center gap-6 w-full z-30">
                <button @click="finishFocus(element)" class="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-50 text-white font-black px-12 py-5 md:px-20 md:py-7 rounded-xl md:rounded-2xl transition-all text-sm md:text-xl uppercase tracking-widest shadow-xl active:scale-95">Complete Mission</button>
                <button @click="togglePause(element)" class="text-[10px] font-black uppercase tracking-[0.3em] transition-all flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5" :class="element.isPaused ? 'text-emerald-400 border-emerald-500/30' : 'text-slate-400 hover:text-amber-400'">
                  <span class="flex h-2 w-2 relative">
                    <span v-if="!element.isPaused" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span class="relative inline-flex rounded-full h-2 w-2" :class="element.isPaused ? 'bg-emerald-500' : 'bg-indigo-500'"></span>
                  </span>
                  {{ element.isPaused ? 'Resume Mission' : 'Pause Mission' }}
                </button>
              </div>
            </div>
          </template>
          <template #header v-if="focusList.length === 0">
            <div class="text-center opacity-40 select-none cursor-default hidden md:block">
              <p class="text-slate-500 font-black md:text-xl tracking-tight uppercase">DRAG A TASK HERE TO FOCUS</p>
            </div>
          </template>
          <div v-if="focusList.length > 0" class="absolute inset-0 z-0 bg-gradient-to-tr transition-colors duration-1000 pointer-events-none" :class="focusList[0].isPaused ? 'from-slate-900 via-amber-900/20 to-slate-900' : 'from-slate-900 via-indigo-900/10 to-slate-900'">
            <div class="focus-glow" :class="focusList[0].isPaused ? 'pause-glow' : 'active-glow'"></div>
          </div>
        </draggable>
      </section>

      <div class="flex flex-col gap-2 mb-6 md:mb-8">
        
        <div class="flex flex-col md:flex-row gap-3">
          <input 
            v-model="newTodo" 
            @keydown.enter="handleInputEnter" 
            placeholder="What's next?" 
            class="flex-1 bg-white border border-slate-300 rounded-xl md:rounded-xl px-5 py-3 md:px-6 md:py-4 shadow-sm text-base md:text-lg font-medium focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none" 
          />
          <button @click="() => addTodo()" class="bg-slate-800 text-white font-black px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-xl hover:bg-slate-900 transition-all text-xs md:text-sm shadow-md active:scale-95 uppercase tracking-widest">Add</button>
        </div>

        <div class="px-1 mt-1">
          <div class="flex items-center gap-3 mb-1.5">
            <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Daily Routines</p>
            
            <div class="flex items-center gap-2">
              <button 
                @click="isManagingRoutines = !isManagingRoutines" 
                class="w-5 h-5 flex items-center justify-center rounded-full bg-slate-200/50 hover:bg-white text-slate-400 transition-all"
                :class="isManagingRoutines ? 'bg-indigo-100 text-indigo-600 shadow-inner' : ''"
                title="Manage Routines"
              >
                <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </button>
              
              <form v-if="isManagingRoutines" @submit.prevent="addRoutine" class="flex items-center gap-2 animate-fade-in-left">
                <input v-model="newRoutineText" placeholder="New routine..." class="w-24 bg-white/50 border-none rounded px-2 py-0.5 text-[10px] font-bold focus:bg-white focus:ring-1 focus:ring-indigo-200 outline-none placeholder:text-slate-400" />
                <button type="submit" class="w-5 h-5 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 active:scale-95 transition-all">
                  <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" /></svg>
                </button>
              </form>
            </div>
          </div>
          
          <div class="flex items-start gap-2 flex-wrap">
            <button 
              v-for="task in routineList" 
              :key="task.id" 
              @click="handleRoutineClick(task)"
              class="group flex items-center gap-1.5 bg-white/40 border border-slate-200/50 px-3 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
              :class="isManagingRoutines ? 'hover:bg-red-50 hover:border-red-200 text-slate-500 hover:text-red-500' : 'hover:bg-white hover:border-indigo-200 text-slate-500 hover:text-indigo-600'"
            >
              <span v-if="!isManagingRoutines" class="text-indigo-400 group-hover:text-indigo-600 text-xs leading-none mb-0.5">+</span>
              <span v-else class="text-red-400 group-hover:text-red-600 text-xs leading-none mb-0.5">×</span>
              {{ task.text }}
            </button>
          </div>
        </div>
      </div>

      <section class="pb-20">
        <h2 class="text-[10px] md:text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 md:mb-6 px-2 italic text-center md:text-left">Backlog: {{ selectedDate }}</h2>
        <draggable v-model="backlogList" group="tasks" item-key="id" :delay="200" :delay-on-touch-only="true" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
          <template #item="{ element }">
            <div 
              class="post-it p-6 md:p-8 rounded-lg shadow-md cursor-grab active:cursor-grabbing transition-all duration-500 flex flex-col min-h-[240px] md:min-h-[260px] relative border-b-4" 
              :style="{ backgroundColor: element.color || '#fff9c4', borderBottomColor: 'rgba(0,0,0,0.1)' }"
              :class="element.completed ? 'opacity-60 grayscale scale-[0.98] -translate-y-0 shadow-sm' : 'hover:shadow-xl md:hover:-translate-y-3'"
            >
              <div class="flex items-start justify-between mb-3 md:mb-4">
                <input 
                  type="checkbox" 
                  :checked="element.completed" 
                  @change="toggleTodo(element)" 
                  class="w-7 h-7 rounded border-slate-400 bg-white text-indigo-600 focus:ring-0 appearance-none border-2 checked:bg-indigo-600 checked:border-indigo-600 transition-all cursor-pointer shadow-sm z-10" 
                />
                <button @click="deleteTodo(element.id)" class="p-2 text-slate-400 hover:text-red-500 transition-all z-10">
                  <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-width="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              <div class="flex-1 flex flex-col gap-2 relative">
                <div class="relative inline-block w-full">
                  <textarea 
                    v-model="element.text" 
                    @change="saveTodos(todos)" 
                    rows="2" 
                    class="font-black text-lg md:text-xl bg-transparent border-none p-0 focus:ring-0 w-full text-slate-900 resize-none leading-tight overflow-hidden transition-all duration-500" 
                    :class="{ 'line-through text-slate-400 decoration-4 decoration-slate-400/60': element.completed }"
                  ></textarea>
                </div>
                <textarea v-model="element.notes" @change="saveTodos(todos)" placeholder="Notes..." class="text-[10px] md:text-xs bg-white/30 border-none rounded-xl p-3 w-full h-16 md:h-20 resize-none focus:ring-1 focus:ring-black/10 outline-none transition-all text-black/70"></textarea>
                
                <button v-if="!element.completed" @click.stop="moveToFocus(element)" class="md:hidden flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-3 rounded-xl mt-2 active:scale-95 transition-all text-xs uppercase tracking-widest shadow-md">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Focus
                </button>
              </div>

              <div class="mt-3 md:mt-4 flex items-end justify-between border-t border-black/5 pt-3 md:pt-4 relative">
                <div class="flex flex-col relative min-w-[100px]">
                  <span class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-tighter italic mb-1">Focus Log</span>
                  <div class="flex items-center gap-2">
                    <button v-if="editingTimeId !== element.id" @click="editingTimeId = element.id" class="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-black/5 transition-all">
                      <span class="text-[10px] font-black uppercase text-indigo-600">{{ formatDuration(element.totalFocusMinutes || 0) }}</span>
                    </button>
                    <input v-else v-model.number="element.totalFocusMinutes" type="number" v-focus @blur="editingTimeId = null; saveTodos(todos)" @keyup.enter="editingTimeId = null; saveTodos(todos)" class="w-10 text-[10px] font-black bg-white/50 border-none rounded p-0 text-center focus:ring-1 focus:ring-indigo-500" />
                    
                    <button @click="activeColorPickerId = (activeColorPickerId === element.id ? null : element.id)" class="p-1 text-slate-400 hover:text-indigo-600 transition-colors">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>
                    </button>
                  </div>
                  <div v-if="activeColorPickerId === element.id" class="absolute bottom-full left-0 mb-2 flex gap-1 p-2 bg-white rounded-lg shadow-2xl border border-slate-200 z-50">
                    <button v-for="c in colorPalette" :key="c" @click="element.color = c; saveTodos(todos); activeColorPickerId = null" class="w-5 h-5 rounded-full border border-black/5" :style="{ backgroundColor: c }"></button>
                  </div>
                </div>
                <div class="text-right shrink-0">
                  <span class="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-tighter italic">Added</span>
                  <span class="text-[9px] font-bold text-slate-400 block leading-tight">{{ formatTime(element.createdAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import draggable from 'vuedraggable'

// --- Auth & Global State Management ---
const isLoggedIn = ref(false), isLoginMode = ref(true), authError = ref('')
const authForm = ref({ username: '', password: '' })
const token = ref(localStorage.getItem('pilot_token')), currentUser = ref(localStorage.getItem('pilot_username') || '')
const isSidebarOpen = ref(false), mainContent = ref(null), editingTimeId = ref(null), activeColorPickerId = ref(null)

// --- Configuration Constants ---
const colorPalette = ['#fff9c4', '#ffcfd2', '#cfdbff', '#e0ffcd', '#f3cfff'], vFocus = { mounted: (el) => el.focus() }
// Routine State
const isManagingRoutines = ref(false)
const newRoutineText = ref('')

// --- Auth Logic (Carefully validated for .value access) ---
const handleAuthAction = () => handleAuth(isLoginMode.value ? 'login' : 'signup')
const handleAuth = async (action) => {
  if (!authForm.value.username || !authForm.value.password) { 
    authError.value = "ID and key required."; return; 
  }
  try {
    const res = await fetch(`/api/auth?action=${action}`, { 
      method: 'POST', 
      body: JSON.stringify(authForm.value),
      headers: { 'Content-Type': 'application/json' }
    })
    if (res.ok) {
      if (action === 'signup') { 
        isLoginMode.value = true; 
        authError.value = "Account created! Please login.";
      } else {
        const data = await res.json();
        token.value = data.token; currentUser.value = authForm.value.username;
        localStorage.setItem('pilot_token', data.token); localStorage.setItem('pilot_username', currentUser.value);
        isLoggedIn.value = true; fetchTodos();
      }
    } else { authError.value = "Access Denied. Check ID/PASS."; }
  } catch (e) { authError.value = "System Error."; }
}
const logout = () => { localStorage.removeItem('pilot_token'); localStorage.removeItem('pilot_username'); window.location.reload(); }

// --- Task and Calendar Data Handling ---
const todos = ref([]), newTodo = ref(''), selectedDate = ref(new Date().toLocaleDateString('en-CA'))
const elapsedTime = ref('0 min'), seconds = ref(0); let timerInterval = null
const calendarDate = ref(new Date())

const currentYear = computed(() => calendarDate.value.getFullYear()), currentMonth = computed(() => calendarDate.value.getMonth())
const currentMonthName = computed(() => calendarDate.value.toLocaleString('en-US', { month: 'long' }))
const daysInMonth = computed(() => new Date(currentYear.value, currentMonth.value + 1, 0).getDate())
const calendarPadding = computed(() => new Date(currentYear.value, currentMonth.value, 1).getDay())

const prevMonth = () => { calendarDate.value = new Date(currentYear.value, currentMonth.value - 1, 1) }, nextMonth = () => { calendarDate.value = new Date(currentYear.value, currentMonth.value + 1, 1) }
const goToToday = () => { const now = new Date(); calendarDate.value = new Date(now.getFullYear(), now.getMonth(), 1); selectedDate.value = now.toLocaleDateString('en-CA'); isSidebarOpen.value = false; }
const formatDate = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
const isDateSelected = (day) => selectedDate.value === formatDate(currentYear.value, currentMonth.value, day)

// --- Helper: Human-readable time duration formatting ---
const formatDuration = (totalMinutes) => {
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}h ${mins}m`;
}

// --- List Synchronization for Drag & Drop ---
// Updated to filter out routine templates
const backlogList = computed({ 
  get: () => todos.value.filter(t => t.targetDate === selectedDate.value && !t.isWorking && !t.isRoutine), 
  set: (val) => syncChanges(val, false) 
})
const focusList = computed({ 
  get: () => todos.value.filter(t => t.isWorking && !t.isRoutine), 
  set: (val) => syncChanges(val, true) 
})
// Computed property for displaying routine chips
const routineList = computed(() => todos.value.filter(t => t.isRoutine))

const syncChanges = (newItems, isWorking) => {
  // Keep routines and other date tasks untouched
  const others = todos.value.filter(t => t.isRoutine || (isWorking ? !t.isWorking : (t.isWorking || t.targetDate !== selectedDate.value)))
  const updated = newItems.map(t => { 
    if (isWorking && !t.isWorking) { t.focusStartedAt = new Date().toISOString(); t.isPaused = false; t.accumulatedMs = 0; } 
    return { ...t, isWorking, targetDate: isWorking ? t.targetDate : selectedDate.value } 
  })
  saveTodos([...others, ...updated])
}

// --- Server Persistence (API calls) ---
const fetchTodos = async () => { if (!token.value) return; const res = await fetch('/api/todos', { headers: { "Authorization": `Bearer ${token.value}` } }); if (res.ok) todos.value = await res.json() || []; }
const saveTodos = async (newTodos) => { todos.value = newTodos; if (!token.value) return; await fetch('/api/todos', { method: 'POST', body: JSON.stringify(newTodos), headers: { "Authorization": `Bearer ${token.value}`, "Content-Type": "application/json" } }) }

// --- Component Actions ---
const handleInputEnter = (e) => { if (!e.isComposing) addTodo() }

// Unified add logic
const addTodo = (taskText = null) => {
  const isManualInput = typeof taskText !== 'string'
  const textToAdd = isManualInput ? newTodo.value : taskText
  
  if (!textToAdd || !textToAdd.trim()) return;

  const item = { 
    id: Date.now(), 
    text: textToAdd.trim(), 
    notes: '', 
    color: '#fff9c4', 
    completed: false, 
    targetDate: selectedDate.value, 
    createdAt: new Date().toISOString(), 
    isWorking: false, 
    focusStartedAt: null, 
    totalFocusMinutes: 0, 
    isPaused: false, 
    accumulatedMs: 0,
    isRoutine: false // Regular task
  }; 
  
  saveTodos([item, ...todos.value]); 
  if (isManualInput) newTodo.value = ''
}

// Routine Management Logic
const handleRoutineClick = (routine) => {
  if (isManagingRoutines.value) {
    if(confirm(`Delete routine "${routine.text}"?`)) {
      saveTodos(todos.value.filter(t => t.id !== routine.id))
    }
  } else {
    addTodo(routine.text)
  }
}

const addRoutine = () => {
  if (!newRoutineText.value.trim()) return;
  const routineItem = {
    id: Date.now(),
    text: newRoutineText.value.trim(),
    createdAt: new Date().toISOString(),
    isRoutine: true, // Mark as a routine template
    color: '#fff9c4'
  }
  saveTodos([...todos.value, routineItem])
  newRoutineText.value = ''
}

const toggleTodo = (todo) => { const others = todos.value.filter(t => t.id !== todo.id); const updated = { ...todo, completed: !todo.completed, isWorking: false }; saveTodos(updated.completed ? [...others, updated] : [updated, ...others]) }
const deleteTodo = (id) => { if (confirm("Remove?")) saveTodos(todos.value.filter(t => t.id !== id)) }

// --- Focus Session Engine (Timer) ---
const updateElapsedDisplay = (task) => {
  if (!task.focusStartedAt) return;
  const now = new Date(), currentSessionMs = task.isPaused ? 0 : (now - new Date(task.focusStartedAt || now)), totalMsInSession = (task.accumulatedMs || 0) + currentSessionMs;
  const totalMinutes = (task.totalFocusMinutes || 0) + Math.floor(totalMsInSession / 60000);
  elapsedTime.value = formatDuration(totalMinutes);
  seconds.value = Math.floor((totalMsInSession / 1000) % 60);
}
const startTimer = () => { stopTimer(); if (focusList.value.length > 0) { const task = focusList.value[0]; updateElapsedDisplay(task); if (!task.isPaused) timerInterval = setInterval(() => updateElapsedDisplay(task), 1000); } }
const stopTimer = () => { if (timerInterval) clearInterval(timerInterval); elapsedTime.value = '0 min'; seconds.value = 0; }

// --- Session Life Cycle Control ---
const togglePause = (todo) => {
  const now = new Date(); if (!todo.isPaused) { const s = now - new Date(todo.focusStartedAt || now); todo.accumulatedMs = (todo.accumulatedMs || 0) + s; todo.isPaused = true; } else { todo.focusStartedAt = now.toISOString(); todo.isPaused = false; }
  saveTodos([...todos.value]);
}
const finishFocus = (todo) => {
  const now = new Date(), currentSessionMs = todo.isPaused ? 0 : (now - new Date(todo.focusStartedAt || now))
  const totalMsInSession = (todo.accumulatedMs || 0) + currentSessionMs, sessionMinutes = Math.floor(totalMsInSession / 60000), others = todos.value.filter(t => t.id !== todo.id)
  saveTodos([...others, { ...todo, completed: true, isWorking: false, totalFocusMinutes: (todo.totalFocusMinutes || 0) + sessionMinutes, accumulatedMs: 0, isPaused: false }]);
}
const moveToFocus = (todo) => { const updated = todos.value.map(t => { if (t.id === todo.id) return { ...t, isWorking: true, isPaused: false, accumulatedMs: 0, focusStartedAt: new Date().toISOString() }; if (t.isWorking) return { ...t, isWorking: false }; return t; }); saveTodos(updated); isSidebarOpen.value = false; if (mainContent.value) mainContent.value.scrollTo({ top: 0, behavior: 'smooth' }); }

// --- Reactivity Watchers & Life Cycle Hooks ---
watch(focusList, (val) => val.length > 0 ? startTimer() : stopTimer(), { deep: true, immediate: true })
const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : ''
onMounted(() => { if (token.value) { isLoggedIn.value = true; fetchTodos() } })
</script>

<style scoped>
.auth-input { @apply w-full bg-slate-50 border border-slate-300 rounded-xl px-6 py-4 text-slate-800 text-lg focus:ring-2 focus:ring-slate-800 outline-none transition-all; }
.timer-display { font-variant-numeric: tabular-nums; }
@media (min-width: 768px) { .post-it { transform: rotate(-1.5deg); } .post-it:nth-child(even) { transform: rotate(1.2deg); } }
@keyframes float { 0%, 100% { transform: translateY(0) rotate(0); } 50% { transform: translateY(-10px) rotate(5deg); } }
.animate-float { animation: float 6s ease-in-out infinite; }
.focus-glow { position: absolute; inset: 0; animation: pulse 10s ease-in-out infinite; }
.active-glow { background: radial-gradient(circle at 50% 50%, rgba(79, 70, 229, 0.1), transparent 70%); }
.pause-glow { background: radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.15), transparent 70%); }
@keyframes pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.1); } }
@keyframes fade-in-left { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
.animate-fade-in-left { animation: fade-in-left 0.2s ease-out; }
</style>
