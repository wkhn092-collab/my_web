export default function StudioLayout({ children }: LayoutProps<'/studio'>) {
  return (
    <div dir="ltr" className="h-dvh">
      {children}
    </div>
  );
}
