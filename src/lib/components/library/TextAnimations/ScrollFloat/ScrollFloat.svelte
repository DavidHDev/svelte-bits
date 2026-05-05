<!-- @svelte-bits
{
  "title": "Scroll Float",
  "description": "Scroll-triggered floating text animation with per-character stagger.",
  "dependencies": ["gsap"]
}
-->
<script lang="ts">
    import { onMount } from 'svelte';
    import { gsap } from 'gsap';
    import { ScrollTrigger } from 'gsap/ScrollTrigger';

    gsap.registerPlugin(ScrollTrigger);

    type Props = {
        children: string;
        scrollContainer?: HTMLElement | null;
        containerClass?: string;
        textClass?: string;
        animationDuration?: number;
        ease?: string;
        scrollStart?: string;
        scrollEnd?: string;
        stagger?: number;
    };

    let {
        children = '',
        scrollContainer = null,
        containerClass = '',
        textClass = '',
        animationDuration = 1,
        ease = 'back.inOut(2)',
        scrollStart = 'center bottom+=50%',
        scrollEnd = 'bottom bottom-=40%',
        stagger = 0.03
    }: Props = $props();

    let containerRef: HTMLHeadingElement;

    onMount(() => {
        if (!containerRef) return;

        const charElements = containerRef.querySelectorAll('.char');
        const scroller = scrollContainer || window;

        const anim = gsap.fromTo(
            charElements,
            {
                willChange: 'opacity, transform',
                opacity: 0,
                yPercent: 120,
                scaleY: 2.3,
                scaleX: 0.7,
                transformOrigin: '50% 0%'
            },
            {
                duration: animationDuration,
                ease: ease,
                opacity: 1,
                yPercent: 0,
                scaleY: 1,
                scaleX: 1,
                stagger: stagger,
                scrollTrigger: {
                    trigger: containerRef,
                    scroller,
                    start: scrollStart,
                    end: scrollEnd,
                    scrub: true
                }
            }
        );

        return () => {
            if (anim.scrollTrigger) anim.scrollTrigger.kill();
            anim.kill();
        };
    });

    const chars = $derived(children.split(''));
</script>

<h2 bind:this={containerRef} class="scroll-float {containerClass}">
    <span class="scroll-float-text {textClass}">
        {#each chars as char}
            <span class="char">
                {char === ' ' ? '\u00A0' : char}
            </span>
        {/each}
    </span>
</h2>

<style>
    .scroll-float { overflow: hidden; display: block; }
    .scroll-float-text { display: inline-block; }
    .char { display: inline-block; will-change: transform, opacity; }
</style>