<!--
This example fetches latest Vue Core commits data from GitHub’s API and displays them as a list.
You can switch between the two primary branches.
-->

<script setup>
import { ref, watchEffect } from 'vue'

const API_URL = `/api/users/`
const branches = ['0', '1', '2', '-1']

const currentBranch = ref(branches[0])
const user = ref(null)

watchEffect(async () => {
  // this effect will run immediately and then
  // re-run whenever currentBranch.value changes
  const url = `${API_URL}${currentBranch.value}`
  user.value = await (await fetch(url)).json()
})

function truncate(v) {
  const newline = v.indexOf('\n')
  return newline > 0 ? v.slice(0, newline) : v
}

function formatDate(v) {
  return v.replace(/T|Z/g, ' ')
}
</script>

<template>
  <h1>Latest Vue Core Commits</h1>
  <template v-for="branch in branches">
    <input type="radio"
      :id="branch"
      :value="branch"
      name="branch"
      v-model="currentBranch">
    <label :for="branch">{{ branch }}</label>
  </template>
  <p>用户 ID：{{ currentBranch }}</p>
  <ul v-if="user">
    <li>编号：{{ user.id }}</li>
    <li>姓名：{{ user.name }}</li>
    <li>邮箱：{{ user.email }}</li>
    <li v-if="user.age !== undefined">年龄：{{ user.age }}</li>
    <li v-if="user.created_at">创建时间：{{ formatDate(user.created_at) }}</li>
  </ul>
</template>

<style>
a {
  text-decoration: none;
  color: #42b883;
}
li {
  line-height: 1.5em;
  margin-bottom: 20px;
}
.author,
.date {
  font-weight: bold;
}
</style>