import { ArrowUpDown, ListFilter, Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function FilterBar({ q, setQ, cat, setCat, price, setPrice }) {
  return (
    <div className="my-4 flex w-full flex-1 flex-wrap items-center gap-3">
      <div className="group relative flex min-w-[250px] flex-1 items-center">
        <Search className="pointer-events-none absolute left-3 z-10 size-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <Input
          className="h-10 rounded-xl border-input bg-background pl-9 pr-9 shadow-sm transition-all hover:border-accent"
          placeholder="Tìm đồ uống, món ăn..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {q && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="absolute right-2 size-7 text-muted-foreground hover:text-foreground"
            onClick={() => setQ('')}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="flex min-w-[180px] items-center gap-2">
        <Select value={cat || 'all'} onValueChange={(val) => setCat(val === 'all' ? '' : val)}>
          <SelectTrigger className="relative h-10 w-full rounded-xl border-input bg-background px-3 pl-9 shadow-sm hover:border-accent">
            <ListFilter className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <SelectValue placeholder="Tất cả danh mục" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả danh mục</SelectItem>
            <SelectItem value="coffee">Cà phê</SelectItem>
            <SelectItem value="tea">Trà</SelectItem>
            <SelectItem value="milk-tea">Trà sữa</SelectItem>
            <SelectItem value="juice">Nước ép</SelectItem>
            <SelectItem value="Đồ ăn">Đồ ăn nhẹ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex min-w-[180px] items-center gap-2">
        <Select value={price || 'none'} onValueChange={(val) => setPrice(val === 'none' ? '' : val)}>
          <SelectTrigger className="relative h-10 w-full rounded-xl border-input bg-background px-3 pl-9 shadow-sm hover:border-accent">
            <ArrowUpDown className="pointer-events-none absolute left-3 size-4 text-muted-foreground" />
            <SelectValue placeholder="Sắp xếp giá" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Mặc định</SelectItem>
            <SelectItem value="asc">Giá: Thấp đến cao</SelectItem>
            <SelectItem value="desc">Giá: Cao đến thấp</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
