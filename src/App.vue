<template>
  <div class="flex min-h-screen bg-[#f3f4f6] text-slate-800 font-sans">
    
    <aside class="w-80 bg-white border-r border-slate-200 p-8 flex flex-col gap-8 sticky top-0 h-screen">
      <div>
        <h1 class="text-2xl font-black text-indigo-600 tracking-tighter mb-1">FOCUS HUB</h1>
        <p class="text-xs text-slate-400 font-bold uppercase tracking-widest">Productivity Dashboard</p>
      </div>

      <div class="flex flex-col gap-2">
        <label class="text-[11px] font-black text-slate-400 uppercase tracking-wider">Select Date</label>
        <input 
          type="date" 
          v-model="selectedDate" 
          class="w-full border-2 border-slate-100 rounded-2xl px-4 py-3 text-indigo-600 font-bold focus:border-indigo-500 outline-none bg-slate-50 transition-all"
        />
      </div>

      <div class="mt-auto p-5 bg-indigo-50 rounded-3xl">
        <p class="text-sm font-bold text-indigo-700 mb-1">English Study Tip</p>
        <p class="text-xs text-indigo-500 leading-relaxed">
          "Try labeling your tasks with action verbs like 'Draft', 'Review', or 'Analyze' to practice business English."
        </p>
      </div>
    </aside>

    <main class="flex-1 p-12 overflow-y-auto">
      
      <section class="mb-12">
        <h2 class="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-4 px-2">Focus Zone</h2>
        <draggable 
          v-model="focusList" 
          group="tasks" 
          item-key="id"
          class="focus-zone-drop min-h-[200px] rounded-[2.5rem] border-4 border-dashed border-indigo-100 flex items-center justify-center p-8 transition-all"
          :class="{ 'bg-indigo-600 border-none shadow-2xl shadow-indigo-200': focusList.length > 0 }"
        >
          <template #item="{ element }">
            <div class="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-[2rem] p-10 text-white relative">
              <span class="absolute top-8 left-8 flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <div class="text-center">
                <h3 class="text-4xl font-black mb-4">{{ element.text }}</h3>
                <div class="flex justify-center items-center gap-4 text-indigo-100 font-bold text-sm">
                  <span>Started: {{ formatTime(element.createdAt) }}</span>
                  <span class="px-3 py-1 bg-white/20 rounded-full">ACTIVE OBJECTIVE</span>
                </div>
                <button 
                  @click="finishFocus(element)"
                  class="mt-8 bg-white text-indigo-600 font-black px-10 py-4 rounded-2xl hover:bg-indigo-50 transition-all active:scale-95 shadow-xl"
                >
                  FINISH FOCUS
                </button>
              </div>
            </div>
          </template>
          <template #header v-if="focusList.length === 0">
            <div class="text-center">
              <p class="text-slate-300 font-black text-xl">DRAG A TASK HERE TO FOCUS</p>
              <p class="text-slate-300 text-sm mt-1 uppercase tracking-widest font-bold">One thing at a time</p>
            </div>
          </template>
        </draggable>
      </section>

      <div class="flex gap-4 mb-12">
        <input 
          v-model="newTodo" 
          @keyup.enter="addTodo" 
          placeholder="Type a new task and press Enter..." 
          class="flex-1 bg-white border-none rounded-2xl px-8 py-5 shadow-sm text-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
        <button @click="addTodo" class="bg-slate-900 text-white font-black px-10 py-5 rounded-2xl hover:bg-indigo-600 transition-all shadow-lg">
          CREATE
        </button>
      </div>

      <section>
        <div class="flex items-center justify-between mb-6 px-2">
          <h2 class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
            Backlog for {{ selectedDate }}
          </h2>
        </div>

        <draggable 
          v-model="backlogList" 
          group="tasks" 
          item-key="id"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 min-h-[200px]"
        >
          <template #item="{ element }">
            <div 
              class="post-it p-6 rounded-xl shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-xl hover:-translate-y-1 relative group"
              :class="element.completed ? 'bg-slate-200' : 'bg-yellow-100'"
            >
              <button @click="deleteTodo(element.id)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-all">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              
              <div class="mb-4">
                <p class="font-bold text-lg leading-tight" :class="{ 'line-through text-slate-400': element.completed }">
                  {{ element.text }}
                </p>
              </div>
              
              <div class="flex items-center justify-between mt-auto pt-4 border-t border-black/5">
                <span class="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                  {{ formatTime(element.createdAt) }}
                </span>
                <input 
                  type="checkbox" 
                  :checked="element.completed" 
                  @change="toggleTodo(element)"
                  class="w-5 h-5 rounded border-none bg-black/10 text-slate-900 focus:ring-0 cursor-pointer"
                />
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

const todos = ref([])
const newTodo = ref('')
const selectedDate = ref(new Date().toLocaleDateString('en-CA'))

// --- DRAGGABLE WRAPPER LOGIC ---

// Backlog (Tasks on the selected date that are NOT currently in focus)
const backlogList = computed({
  get: () => todos.value.filter(t => t.targetDate === selectedDate.value && !t.isWorking),
  set: (val) => updateList(val, false)
})

// Focus Zone (Single task currently being worked on)
const focusList = computed({
  get: () => todos.value.filter(t => t.isWorking),
  set: (val) => updateList(val, true)
})

const updateList = (newItems, isWorkingStatus) => {
  // Update the status of items moved into this list
  const updatedIds = new Set(newItems.map(i => i.id))
  
  const updatedTodos = todos.value.map(t => {
    if (updatedIds.has(t.id)) {
      return { ...t, isWorking: isWorkingStatus, targetDate: selectedDate.value }
    }
    // If it's a focus list update, and the item isn't in it anymore, set isWorking to false
    if (isWorkingStatus && t.isWorking && !updatedIds.has(t.id)) {
        return { ...t, isWorking: false }
    }
    return t
  })
  saveTodos(updatedTodos)
}

// --- DATA ACTIONS ---

const fetchTodos = async () => {
  try {
    const res = await fetch('/api/todos')
    if (res.ok) todos.value = await res.json() || []
  } catch (e) { console.error(e) }
}

const saveTodos = async (newTodos) => {
  todos.value = newTodos
  try {
    await fetch('/api/todos', { method: 'POST', body: JSON.stringify(newTodos) })
  } catch (e) { console.error(e) }
}

const addTodo = async () => {
  if (!newTodo.value.trim()) return
  const item = { 
    id: Date.now(), 
    text: newTodo.value, 
    completed: false, 
    targetDate: selectedDate.value,
    createdAt: new Date().toISOString(),
    isWorking: false 
  }
  await saveTodos([item, ...todos.value])
  newTodo.value = ''
}

const toggleTodo = async (todo) => {
  const newTodos = todos.value.map(t => 
    t.id === todo.id ? { ...t, completed: !t.completed, isWorking: false } : t
  )
  await saveTodos(newTodos)
}

const finishFocus = async (todo) => {
  // Logic: Mark as completed and remove from focus zone
  const newTodos = todos.value.map(t => 
    t.id === todo.id ? { ...t, completed: true, isWorking: false } : t
  )
  await saveTodos(newTodos)
}

const deleteTodo = async (id) => {
  if (confirm("Delete this post-it?")) {
    const newTodos = todos.value.filter(t => t.id !== id)
    await saveTodos(newTodos)
  }
}

const formatTime = (isoString) => {
  if (!isoString) return ''
  return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })
}

onMounted(fetchTodos)
</script>

<style scoped>
.post-it {
  transform: rotate(-1deg);
  background-image: linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(0,0,0,0.02) 100%);
}
.post-it:nth-child(even) {
  transform: rotate(1deg);
}
.focus-zone-drop {
  perspective: 1000px;
}
</style>
