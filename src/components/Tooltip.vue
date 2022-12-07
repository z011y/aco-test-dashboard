<template>
    <div class="tooltip bg-[#4b5563] rounded absolute p-2 transition text-white">
        <slot></slot>
    </div>
</template>

<style scoped>
.tooltip::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #4B5563 transparent transparent transparent;
}
</style>