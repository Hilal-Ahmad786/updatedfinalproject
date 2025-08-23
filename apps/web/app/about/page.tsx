import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Mail, Linkedin, Heart, Target, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="container py-12">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="mb-8">
            <img
              src="/images/authors/logo.png"
              alt="Seda Tokmak"
              className="w-32 h-32 rounded-full mx-auto mb-6 shadow-lg"
            />
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
              Merhaba, Ben <span className="gradient-text">Seda</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              100leşme yolculuğunun yazarı, yürüyeni ve en çok da tanığı
            </p>
          </div>
        </div>

        {/* Ana Hikaye */}
        <div className="prose prose-lg max-w-none mb-16">
          <Card className="glass p-8 mb-8">
            <CardContent className="p-0">
              <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Heart className="mr-2 h-6 w-6 text-primary" />
                Ben Kimim?
              </h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
                Mühendis | Genel Müdür (Global Şirket) | Anne | Dost | Öğrenci | Yazar | Yürüyen bir soru.
                </blockquote>
                  
                  Profesyonel hayatın içinde, global bir şirkette genel müdür olarak kararlar veren, "globale ast, lokale üst" modunda yaşayan, ekipler yöneten bir liderim.
                  Aynı zamanda iç sesiyle boğuşan, kırılganlıkla gücü bir arada taşıyan bir kadınım.
                  Planlama ve netlik takıntısı olan, ama hâlâ "öz-sevgi" konusunda çırak kalan biri.
                  "Hallice yaş"ta ama hâlâ öğrenen, hâlâ değişenim.
                  Kısaca ben: Hayatın direksiyonuna geçmeye karar veren biriyim.

                </p>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Heart className="mr-2 h-6 w-6 text-primary" />
                Peki Derdim Ne?
              </h2>
                <p>
                "Ben değil, atalar kusurlu" diyerek sıyrılamayacağım bir hayatın tam ortasındayım. Bu yüzden 100leşmeye karar verdim. Yıllar sonra “Hadi ya, bunu niye daha önce bilmiyordum?” dememek için... Şimdi, “Ne yapabilirim?” sorusunun peşindeyim.
                </p>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Heart className="mr-2 h-6 w-6 text-primary" />
                Sonuç?
              </h2>
              <p>
              Her yazıda biraz kırılganlık, biraz direnç; biraz umut, biraz da gerçek var. Çünkü hayat da böyle: net değil ama çok gerçek.
Eğer sen de kendinle 100leşmeye cesaret ediyorsan, hoş geldin.
                </p>


                <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Heart className="mr-2 h-6 w-6 text-primary" />
                100leşmenin Doğuşu               </h2>
              <p>
              Bugüne kadar okudum, çalıştım, çabaladım, uyum sağladım. Bazen birileri tarafından yönetildim, bazen de ben yönettim. "Hayatı iyi yaşamak" için gerekli denilen her şeyi sırasıyla yaptım. Ama bir gün... Tüm bu "başarı için yapılacaklar" listelerine rağmen aynaya baktığımda, gözlerimde bir boşluk gördüm. İçimden bir ses sordu:
                </p>

                <blockquote className="border-l-4 border-primary pl-4 italic text-lg">
                “Bu hayat gerçekten benim mi?”                </blockquote>
              <p>
              O gün durdum. Sadece bir günü, bir kararı ya da bir ilişkiyi değil; koca bir hayatı sorguladım. Kim için yaşıyordum? Ne için karar alıyordum? Ve en önemlisi: Ben kimdim?
                </p>

              </div>
            </CardContent>
          </Card>
        </div>

        

        {/* 100leşme Nedir */}
        <Card className="glass mb-16">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Peki  nedir bu 100leşme?</h2>
            <p className="text-muted-foreground text-center mb-6">
              100leşme, sorularla başlayan bir içsel kalkışmadır. 
              Dışarıdan sessiz ama içten bir devrim gibidir.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Bu blog değildir:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>❌ Yol göstermeye çalışan bir rehber</li>
                  <li>❌ Günlük</li>
                  <li>❌ Şikâyet defteri</li>
                  <li>❌ Özlü söz arşivi</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Bu blog:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✅ Kendisiyle karşılaşmaya cesaret edenlerin sesi</li>
                  <li>✅ Kaybolduklarında yeniden yön bulanların haritası</li>
                  <li>✅ "Yalnız olmadığını bilmenin" verdiği derin huzur</li>
                  <li>✅ Kendi yüzleşmemi yazma alanım</li>
                </ul>
              </div>
  

            </div>
            <p className='mt-6'>
                Benim niyetim, akıl vermek değil. Çünkü çok iyi biliyorum ki: “Tüm akılları pazara çıkarmışlar, herkes yine gidip kendi aklını almış.” Bu yüzden bu yolculukta tek iddiam, kendi yüzleşmemi yazmak. Ve belki de, seni de bu eşlik hâline davet etmek.               
                 </p>
          </CardContent>
        </Card>

        {/* İletişim */}
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-6">Benimle İletişime Geç</h2>
          <p className="text-muted-foreground mb-8">
            Eğer sen de kendinle 100leşmeye cesaret ediyorsan, hoş geldin.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="default" size="lg">
              <Link href="mailto:100lesmeofficial@gmail.com">
                <Mail className="mr-2 h-4 w-4" />
                E-posta Gönder
              </Link>
            </Button>

          </div>
        </div>
      </div>
    </div>
  )
}
