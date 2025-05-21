import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PlusCircle, X } from 'lucide-react'

interface CastSectionProps {
  cast: string[]
  onChange: (newCast: string[]) => void
}

export default function CastSection({ cast, onChange }: CastSectionProps) {
  // const [castMembers, setCastMembers] = useState(cast)

  const handleCastChange = (index: number, value: string) => {
    const newCast = [...cast];
    newCast[index] = value;
    onChange(newCast);
  };

  const addCastMember = () => {
    onChange([...cast, '']);
  };

  const removeCastMember = (index: number) => {
    const newCast = cast.filter((_, i) => i !== index);
    onChange(newCast);
  };

  return (
    <div className="grid items-start gap-4">
      <Label>Cast</Label>
      <div className="space-y-2">
        {cast.map((member, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={member}
              onChange={(e) => handleCastChange(index, e.target.value)}
              placeholder="Cast member name"
            />
            <Button type="button" variant="ghost" size="icon" onClick={() => removeCastMember(index)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={addCastMember}>
          <PlusCircle className="h-4 w-4 mr-2" /> Add Cast Member
        </Button>
      </div>
    </div>
  )
}

