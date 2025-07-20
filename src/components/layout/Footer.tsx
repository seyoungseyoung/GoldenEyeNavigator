export function Footer() {
  return (
    <footer className="py-6 md:px-8 md:py-0 border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            <strong>투자 유의사항:</strong> 본 서비스에서 제공하는 정보는 투자 참고 자료이며, 투자에 대한 최종 결정은 본인의 판단과 책임 하에 이루어져야 합니다. 과거의 성과가 미래의 수익을 보장하지 않습니다.
          </p>
        </div>
         <p className="text-sm text-muted-foreground whitespace-nowrap">
          문의: <a href="mailto:shae03030303@gmail.com" className="font-medium text-foreground hover:text-primary transition-colors">shae03030303@gmail.com</a>
        </p>
      </div>
    </footer>
  );
}
