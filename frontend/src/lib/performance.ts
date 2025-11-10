/**
 * Performance monitoring utilities
 * Tracks Core Web Vitals and custom metrics
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

// Core Web Vitals thresholds
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 }, // First Contentful Paint
  LCP: { good: 2500, poor: 4000 }, // Largest Contentful Paint
  FID: { good: 100, poor: 300 },   // First Input Delay
  CLS: { good: 0.1, poor: 0.25 },  // Cumulative Layout Shift
  TTFB: { good: 800, poor: 1800 }, // Time to First Byte
};

function getRating(value: number, thresholds: { good: number; poor: number }): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.poor) return 'needs-improvement';
  return 'poor';
}

export function measurePageLoad() {
  if (typeof window === 'undefined' || !('performance' in window)) return;

  const metrics: PerformanceMetric[] = [];
  
  // Wait for page load
  window.addEventListener('load', () => {
    // Get navigation timing
    const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    if (perfData) {
      // Time to First Byte
      const ttfb = perfData.responseStart - perfData.requestStart;
      metrics.push({
        name: 'TTFB',
        value: ttfb,
        rating: getRating(ttfb, THRESHOLDS.TTFB),
        timestamp: Date.now(),
      });

      // DOM Content Loaded
      const dcl = perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart;
      metrics.push({
        name: 'DCL',
        value: dcl,
        rating: dcl < 1000 ? 'good' : dcl < 2000 ? 'needs-improvement' : 'poor',
        timestamp: Date.now(),
      });
    }

    // First Contentful Paint
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
    if (fcpEntry) {
      metrics.push({
        name: 'FCP',
        value: fcpEntry.startTime,
        rating: getRating(fcpEntry.startTime, THRESHOLDS.FCP),
        timestamp: Date.now(),
      });
    }

    // Log metrics in development
    if (import.meta.env.DEV) {
      console.group('⚡ Performance Metrics');
      metrics.forEach(metric => {
        const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
        console.log(`${emoji} ${metric.name}: ${metric.value.toFixed(2)}ms (${metric.rating})`);
      });
      console.groupEnd();
    }
  });

  // Observe Largest Contentful Paint
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        
        if (lastEntry) {
          const lcp = lastEntry.renderTime || lastEntry.loadTime;
          const metric: PerformanceMetric = {
            name: 'LCP',
            value: lcp,
            rating: getRating(lcp, THRESHOLDS.LCP),
            timestamp: Date.now(),
          };
          
          if (import.meta.env.DEV) {
            const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
            console.log(`${emoji} LCP: ${lcp.toFixed(2)}ms (${metric.rating})`);
          }
        }
      });
      
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (e) {
      // Ignore if not supported
    }

    // Observe Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        
        if (import.meta.env.DEV) {
          const rating = getRating(clsValue, THRESHOLDS.CLS);
          const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
          console.log(`${emoji} CLS: ${clsValue.toFixed(3)} (${rating})`);
        }
      });
      
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (e) {
      // Ignore if not supported
    }

    // Observe First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const firstInput = entries[0] as any;
        
        if (firstInput) {
          const fid = firstInput.processingStart - firstInput.startTime;
          const metric: PerformanceMetric = {
            name: 'FID',
            value: fid,
            rating: getRating(fid, THRESHOLDS.FID),
            timestamp: Date.now(),
          };
          
          if (import.meta.env.DEV) {
            const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
            console.log(`${emoji} FID: ${fid.toFixed(2)}ms (${metric.rating})`);
          }
        }
      });
      
      fidObserver.observe({ type: 'first-input', buffered: true });
    } catch (e) {
      // Ignore if not supported
    }
  }
}

/**
 * Measure the time it takes to execute a function
 */
export function measureFunction<T>(name: string, fn: () => T): T {
  const start = performance.now();
  const result = fn();
  const duration = performance.now() - start;
  
  if (import.meta.env.DEV && duration > 16) { // Warn if > 1 frame (16ms at 60fps)
    console.warn(`⚠️ Slow function "${name}": ${duration.toFixed(2)}ms`);
  }
  
  return result;
}

/**
 * Track component render time in development
 */
export function trackRenderTime(componentName: string) {
  if (!import.meta.env.DEV) return;
  
  const start = performance.now();
  
  return () => {
    const duration = performance.now() - start;
    if (duration > 16) {
      console.warn(`⚠️ Slow render "${componentName}": ${duration.toFixed(2)}ms`);
    }
  };
}

/**
 * Get current memory usage (Chrome only)
 */
export function getMemoryUsage() {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    return {
      usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
      totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
      jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    };
  }
  return null;
}

