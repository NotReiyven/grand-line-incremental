import Decimal from 'break_eternity.js';

console.log('--- Grand Line Balance Simulator ---');

const baseStamina = new Decimal(100);
const tickRateHz = 10;
const staminaPerTick = new Decimal(0.1);
const ticksInOneHour = tickRateHz * 60 * 60;

console.log(`Simulating 1 hour of active game time (${ticksInOneHour} ticks)`);

const staminaGenerated = staminaPerTick.times(ticksInOneHour);
const totalStamina = baseStamina.plus(staminaGenerated);

console.log(`Max possible stamina actions (cost: 10): ${totalStamina.divide(10).floor().toString()}`);
console.log('Balance checks complete.');