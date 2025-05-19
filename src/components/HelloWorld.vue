<template>
  <div class="python-ide">
    <div class="editor-panel">
      <div class="toolbar">
         <button @click="createNewFile">New File</button>
        <button @click="saveTempFile">Save</button>
        <button @click="runCode" :disabled="isRunning">
          {{ isRunning ? 'Running...' : 'Run (F5)' }}
        </button>
        <span class="filename">{{ currentFilename }}</span>
      </div>
      
      <div ref="editorElement" class="editor"></div>
    </div>
    <h1>Terminal Output</h1>
    <div class="terminal-panel">
      <div ref="terminalElement" class="terminal"></div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { EditorView, keymap } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { python } from '@codemirror/lang-python'
import { oneDark } from '@codemirror/theme-one-dark'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'

export default {
  name: 'HelloWorld',
  setup() {
    // Editor setup
    const editorElement = ref(null)
    const editorView = ref(null)
     const currentFilename = ref('main.py')
    const files = ref({
      'main.py': '# Welcome to Python IDE!\nprint("Hello, World!")\n'
    })

    // Terminal setup
    const terminalElement = ref(null)
    const terminalView = ref(null)
    const terminalHistory = ref([])
    const terminalIndex = ref(-1)
    const prompt = ref('>>> ')

    // UI state
    const theme = ref('light')
    const isRunning = ref(false)
   
    // Initialize editor
    const initEditor = () => {
      editorView.value = new EditorView({
        state: EditorState.create({
          doc: files.value[currentFilename.value],
          extensions: [
            python(),
            theme.value === 'dark' ? oneDark : [],
            history(),
            keymap.of([
              ...defaultKeymap,
              ...historyKeymap,
              {
                key: 'F5',
                run: runCode
              },
              {
                key: 'Ctrl-s',
                run: saveTempFile,
                preventDefault: true
              }
            ]),
            EditorView.lineWrapping
          ]
        }),
        parent: editorElement.value
      })
    }

    // Create new temporary file
    const createNewFile = () => {
      const filename = `temp_${Date.now()}.py`
      files.value[filename] = '# New Python File\n\n'
      currentFilename.value = filename
      refreshEditor()
    }

    // Save current file
    const saveTempFile = () => {
      if (!editorView.value) return
      files.value[currentFilename.value] = editorView.value.state.doc.toString()
      addToTerminal(`Saved ${currentFilename.value}\n${prompt.value}`)
      return true
    }
    // Refresh editor with current file content
    const refreshEditor = () => {
      if (editorView.value) {
        editorView.value.dispatch({
          changes: {
            from: 0,
            to: editorView.value.state.doc.length,
            insert: files.value[currentFilename.value] || ''
          }
        })
      }
    }

    // Initialize terminal
    const initTerminal = () => {
      terminalView.value = new EditorView({
        state: EditorState.create({
          doc: prompt.value,
          extensions: [
            theme.value === 'dark' ? oneDark : [],
            EditorState.readOnly.of(false),
            EditorView.editable.of(true),
            keymap.of([
              {
                key: 'Enter',
                run: executeTerminalCommand
              },
              {
                key: 'ArrowUp',
                run: navigateHistoryUp
              },
              {
                key: 'ArrowDown',
                run: navigateHistoryDown
              },
              {
                key: 'Home',
                run: moveToPromptStart
              }
            ]),
            EditorView.theme({
              '&': {
                backgroundColor: theme.value === 'dark' ? '#1a1a1a' : '#f5f5f5',
                color: theme.value === 'dark' ? '#f0f0f0' : '#333',
                fontFamily: 'monospace',
                fontSize: '14px'
              },
              '.cm-content': {
                caretColor: '#f0f0f0'
              }
            })
          ]
        }),
        parent: terminalElement.value
      })
    }

    // Run Python code
   // Replace the mockPythonExecution function with:
// const executePythonCode = async (code) => {
  
//     const formData = new FormData()
//     formData.append('code', code)
    
//     const response = await fetch('http://localhost:8000/editor/execute/', {
//       method: 'POST',
//       body: formData
//     })
    
//     const result = await response.json()
    
//     if (result.error) {
//       throw new Error(result.output)
//     }
    
//     return result.output
  
// }

// Run Python code with temporary file creation
    const runCode = async () => {
      if (!editorView.value) return
      
      isRunning.value = true
      await saveTempFile() // Save before running
      const codeToRun = files.value[currentFilename.value]
      
      addToTerminal(`Running ${currentFilename.value}:\n`)
      
      try {
        const formData = new FormData()
        formData.append('code', codeToRun)
        formData.append('filename', currentFilename.value)
        
        const response = await fetch('http://localhost:8000/editor/execute/', {
          method: 'POST',
          body: formData
        })
        
        const result = await response.json()
        
        if (result.error) {
          throw new Error(result.output)
        }
        
        addToTerminal(`${result.output}\n${prompt.value}`)
      } catch (err) {
        addToTerminal(`Error: ${err.message}\n${prompt.value}`)
      } finally {
        isRunning.value = false
      }
      return true
    }


    // // Mock Python execution
    // const mockPythonExecution = (code) => {
    //   return new Promise((resolve) => {
    //     setTimeout(() => {
    //       if (code.includes('print(')) {
    //         const matches = code.match(/print\(([^)]+)\)/g)
    //         if (matches) {
    //           resolve(matches.map(m => 
    //             m.replace(/print\((['"]?)(.+?)\1\)/, '$2')
    //           ).join('\n'))
    //         }
    //       }
    //       resolve("Code executed successfully (mock implementation)")
    //     }, 500)
    //   })
    // }

    // Terminal functions
    const addToTerminal = (text) => {
      if (!terminalView.value) return
      
      terminalView.value.dispatch({
        changes: {
          from: terminalView.value.state.doc.length,
          insert: text
        },
        selection: { anchor: terminalView.value.state.doc.length + text.length }
      })
    }

    const executeTerminalCommand = (view) => {
      const doc = view.state.doc.toString()
      const command = doc.slice(doc.lastIndexOf('\n') + 1 + prompt.value.length)
      
      if (command.trim()) {
        terminalHistory.value.push(command)
        terminalIndex.value = terminalHistory.value.length
        
        // Process command
        const output = processTerminalCommand(command)
        addToTerminal(`\n${output}\n${prompt.value}`)
      } else {
        addToTerminal(`\n${prompt.value}`)
      }
      return true
    }

    const processTerminalCommand = (command) => {
      switch (command.trim()) {
        case 'clear':
          setTimeout(() => {
            terminalView.value.dispatch({
              changes: {
                from: 0,
                to: terminalView.value.state.doc.length,
                insert: prompt.value
              }
            })
          }, 10)
          return ''
        case 'help':
          return 'Available commands: clear, help'
        default:
          return `Command not found: ${command}`
      }
    }

    const navigateHistoryUp = (view) => {
      if (terminalHistory.value.length === 0) return false
      
      if (terminalIndex.value > 0) {
        terminalIndex.value--
        replaceTerminalLine(view, terminalHistory.value[terminalIndex.value])
      }
      return true
    }

    const navigateHistoryDown = (view) => {
      if (terminalIndex.value < terminalHistory.value.length - 1) {
        terminalIndex.value++
        replaceTerminalLine(view, terminalHistory.value[terminalIndex.value])
      } else if (terminalIndex.value === terminalHistory.value.length - 1) {
        terminalIndex.value++
        replaceTerminalLine(view, '')
      } else {
        return false
      }
      return true
    }

    const replaceTerminalLine = (view, content) => {
      const doc = view.state.doc.toString()
      const lastPromptPos = doc.lastIndexOf('\n') + 1
      const currentLine = doc.slice(lastPromptPos + prompt.value.length)
      
      view.dispatch({
        changes: {
          from: lastPromptPos + prompt.value.length,
          to: lastPromptPos + prompt.value.length + currentLine.length,
          insert: content
        },
        selection: { anchor: view.state.doc.length }
      })
    }

    const moveToPromptStart = (view) => {
      const doc = view.state.doc.toString()
      const lastPromptPos = doc.lastIndexOf('\n') + 1
      view.dispatch({
        selection: { anchor: lastPromptPos + prompt.value.length }
      })
      return true
    }

    // Watch for theme changes
    watch(theme, (newTheme) => {
      if (editorView.value) {
        editorView.value.dispatch({
          effects: EditorView.reconfigure.of([
            python(),
            newTheme === 'dark' ? oneDark : [],
            history(),
            keymap.of([...defaultKeymap, ...historyKeymap])
          ])
        })
      }
      if (terminalView.value) {
        terminalView.value.dispatch({
          effects: EditorView.reconfigure.of([
            EditorState.readOnly.of(false),
            EditorView.theme({
              '&': {
                backgroundColor: newTheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                color: newTheme === 'dark' ? '#f0f0f0' : '#333'
              }
            })
          ])
        })
      }
    })

    // Initialize components
    onMounted(() => {
      initEditor()
      initTerminal()
    })

    // Clean up
    onBeforeUnmount(() => {
      editorView.value?.destroy()
      terminalView.value?.destroy()
    })

    return {
      editorElement,
      terminalElement,
      theme,
      isRunning,
      runCode,
      createNewFile,
      saveTempFile,
      currentFilename
    }
  }
}
</script>

<style scoped>
.python-ide {
  display: flex;
  flex-direction: column;
  height: 100vh;
  font-family: Arial, sans-serif;
}

.editor-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #444;
}

.toolbar {
  padding: 8px;
  background: #2d2d2d;
  display: flex;
  gap: 10px;
}

button {
  padding: 6px 12px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #666;
  cursor: not-allowed;
}

.theme-select {
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid #555;
  background: #333;
  color: white;
}

.editor {
  flex: 1;
  overflow: auto;
}

.terminal-panel {
  flex: 1;
  overflow: hidden;
}

.terminal {
  height: 100%;
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  overflow-y: auto;
}

/* Custom scrollbars */
.editor::-webkit-scrollbar,
.terminal::-webkit-scrollbar {
  width: 8px;
}

.editor::-webkit-scrollbar-track,
.terminal::-webkit-scrollbar-track {
  background: #2d2d2d;
}

.editor::-webkit-scrollbar-thumb,
.terminal::-webkit-scrollbar-thumb {
  background: #555;
  border-radius: 4px;
}

.editor::-webkit-scrollbar-thumb:hover,
.terminal::-webkit-scrollbar-thumb:hover {
  background: #666;
}
h1 {
  padding: 20px;
  margin: 0;
  background: #2d2d2d;
  color: white;
}
.filename {
  margin-left: auto;
  padding: 0 10px;
  color: #aaa;
  font-family: monospace;
}
</style>