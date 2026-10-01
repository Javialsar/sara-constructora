const { execSync } = require('child_process');

const envs = {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'pk_test_51THewTRRftshvQ5jZIqVNuFESRx7MSWoxqL2XKrCzajBT7doWEb9Q2CTjKxBdXwC8IcvhGIxjmYSA753dsTl54M800FYQHk5Zs',
  STRIPE_SECRET_KEY: 'sk_test_51THewTRRftshvQ5j5fFr6mvYkROBMKmOkntozSFxWmJj2tLJH6GdzLwuO8KualGZv8YhJT0vJlJmMhbyrGPqZXE800Ak9BLZc1',
  STRIPE_WEBHOOK_SECRET: 'whsec_HuTEetWjESnZQqRFehjyPAZfMNGSqBRA'
};

const environments = ['production', 'preview', 'development'];

for (const [k, v] of Object.entries(envs)) {
  for (const env of environments) {
    try {
      console.log(`Setting ${k} for ${env}...`);
      execSync(`node -e "process.stdout.write('${v}')" | npx vercel env rm ${k} ${env} -y`, { stdio: 'ignore' });
    } catch (e) {} // ignore if it doesn't exist
    try {
      execSync(`node -e "process.stdout.write('${v}')" | npx vercel env add ${k} ${env}`, { stdio: 'inherit' });
    } catch (e) {
      console.error(`Failed to add ${k} for ${env}`);
    }
  }
}
