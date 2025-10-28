<script setup>
defineProps({
    msg: {
        type: String,
        required: true,
    }
})
</script>

<template>
    <div>
        <h1>你好像想让我显示：{{msg}}</h1>
        <h2>上面是h1，这个是h2</h2>
        <h3>随便塞点东西展示h3现在的样子</h3>
    </div>
</template>