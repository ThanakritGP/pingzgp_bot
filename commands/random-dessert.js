import { EmbedBuilder } from 'discord.js';

const dessertMenu = [
  "บิงซูสตรอว์เบอรรี", "บิงซูมะม่วง", "บิงซูแตงโม", "บิงซูเมลอน",
  "บิงซูชาเขียว", "บราวนี่", "คุ้กกี้", "เค้กส้ม", "เค้กช็อกโกแลต",
  "เค้กกาแฟ", "เค้กสตรอว์เบอร์รี", "ขนมจีบ", "ทาร์ตไข่", "ครัวซองต์",
  "โดนัท", "คัพเค้ก", "ไอศกรีม", "ขนมเบื้อง", "ช็อกโกแลตฟองดู",
  "พายแอปเปิ้ล", "ชีสเค้ก", "คุกกี้ช็อกโกแลตชิป", "พุดดิ้ง",
  "มูสมะม่วง", "เครปเค้ก", "มัฟฟิน", "ช็อกโกแลตมูส", "ไอศกรีมชาเขียว",
  "วาฟเฟิล", "เครป", "ไอศกรีมสตรอว์เบอร์รี", "คัสตาร์ด", "พายเลมอน",
  "พายสตรอว์เบอร์รี", "คัพเค้กช็อกโกแลต", "บานอฟฟี่พาย", "พายมะพร้าว",
  "พายฟักทอง", "ชีสเค้กสตรอว์เบอร์รี", "เบเกอรี่", "เค้กมะพร้าว",
  "เค้กบลูเบอร์รี", "เค้กวนิลลา", "พายส้ม", "โรลเค้ก", "ไอศกรีมผลไม้",
  "พัฟแป้ง", "ครีมบรูเล่", "โฟลต", "มิลค์เชค", "ฮันนี่โทสต์", "ทาร์ตมะพร้าว",
  "ช็อกโกแลตเค้ก", "เค้กมะม่วง", "คุ้กกี้เนย", "เค้กมะพร้าวน้ำหอม",
  "บัตเตอร์เค้ก", "บราวนี่ช็อกโกแลต", "คุกกี้โอ๊ต", "เค้กส้มโอ",
  "ไอศกรีมโกโก้", "เค้กมะนาว", "เค้กกาแฟมอคค่า",
  "ทองหยอด", "ลอยแก้ว", "บัวลอย",
  "กล้วยทอด", "เผือกทอด", "ทับทิมกรอบ", "ฝอยทอง",
  "ขนมปังเนย", "เค้กงาดำ", "คุกกี้ข้าวโอ๊ต", "สตรอว์เบอร์รีชีสเค้ก",
  "ไอศกรีมกะทิ", "ลูกชุบ", "เค้กฟรุ๊ตเค้ก",
  "เค้กนมสด", "ขนมปังสังขยา",
];

export function getRandomDessert() {
  const index = Math.floor(Math.random() * dessertMenu.length);
  return dessertMenu[index];
}

export async function handleDessertMenu(interaction, client) {
  client.user.setActivity('สุ่มเมนูของหวาน', { type: 0 });

  const dessert = getRandomDessert();
  const embed = new EmbedBuilder()
    .setTitle('🍰 ของหวาน :')
    .setDescription(`**${dessert}**`)
    .setColor('#FF66CC')
    .setTimestamp();

  await interaction.reply({ embeds: [embed] });

  setTimeout(() => {
    client.user.setActivity('รอรับคำสั่งจากเด็กเทพศิรินทร์', { type: 3 });
  }, 3000);
}