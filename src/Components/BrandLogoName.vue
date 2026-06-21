<script setup>
import { computed } from 'vue'

const props = defineProps({
    /** `header`: matches navbar (compact until `md`). `footer`: same scale as header at `md+`, with divider always visible. */
    variant: {
        type: String,
        default: 'header',
        validator: (v) => v === 'header' || v === 'footer',
    },
})

const isFooter = computed(() => props.variant === 'footer')
</script>

<template>
    <div
        class="flex items-center font-display"
        :class="isFooter ? 'space-x-4' : 'space-x-2 md:space-x-4'"
    >
        <img
            v-if="isFooter"
            src="../assets/moonman-head.png"
            alt=""
            class="h-11 w-11 shrink-0 object-contain transition-transform duration-300 hover:scale-105"
        />
        <div
            v-else
            class="brand-moonman-wrap shrink-0 transition-transform duration-300 hover:scale-105"
            aria-hidden="true"
        >
            <div class="brand-moonman-glow"></div>
            <img
                src="../assets/moonman-head.png"
                alt=""
                class="brand-moonman-img"
                draggable="false"
            />
        </div>
        <div
            aria-hidden="true"
            class="w-px shrink-0 bg-gradient-to-b from-transparent via-neutral-700 to-transparent"
            :class="
                isFooter
                    ? 'block h-9'
                    : 'hidden h-11 md:block md:h-11'
            "
        ></div>
        <p
            class="font-display tracking-tight text-white leading-none"
            :class="isFooter ? 'text-xl' : 'text-base md:text-xl'"
        >
            McToken
        </p>
    </div>
</template>

<style scoped>
/* Header: moonman at prior token-logo box (2.75rem / 3.15rem) + glow */
.brand-moonman-wrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.75rem;
    height: 2.75rem;
}

@media (min-width: 768px) {
    .brand-moonman-wrap {
        width: 3.15rem;
        height: 3.15rem;
    }
}

.brand-moonman-glow {
    position: absolute;
    inset: -0.5rem;
    border-radius: 9999px;
    background: radial-gradient(
        circle at 50% 48%,
        rgba(56, 189, 248, 0.22) 0%,
        rgba(34, 211, 238, 0.1) 45%,
        rgba(14, 165, 233, 0) 78%
    );
    filter: blur(1.1rem);
    opacity: 0.42;
    z-index: 0;
    pointer-events: none;
}

@media (min-width: 768px) {
    .brand-moonman-glow {
        inset: -0.55rem;
        filter: blur(1.2rem);
    }
}

.brand-moonman-img {
    position: relative;
    z-index: 1;
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 0 0.24rem rgba(34, 211, 238, 0.14));
}
</style>
