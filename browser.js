const { reactive, computed } = Vue

class Store {
  constructor(options) {
    if (options.state) {
      this.state = reactive(options.state)
    }

    if (options.mutations) {
      this.mutations = options.mutations
    }

    if (options.actions) {
      this.actions = options.actions
    }

    if (options.getters) {
      this.getters = {}

      for (const [handle, fn] of Object.entries(options.getters)) {
        Object.defineProperty(this.getters, handle, {
          get: () => computed(() => fn(this.state)).value
        })
      }
    }
  }

  commit(handle, payload) {
    this.mutations[handle](this.state, payload)
  }

  dispatch(handle, payload) {
    const call = this.actions[handle](this, payload)

    if (!call || !typeof call.then !== 'function') {
      return Promise.resolve(call)
    }

    return call
  }
}

const Vuex = {
  Store
}

window.Vuex = Vuex
