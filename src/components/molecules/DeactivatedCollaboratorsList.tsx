'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/atoms/Card'
import { Button } from '@/components/atoms/Button'
import { Typography } from '@/components/atoms/Typography'
import { CollaboratorsService } from '@/services/collaborators.service'
import { toast } from '@/lib/toast'

interface DeactivatedCollaborator {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  deactivated_at: string
}

interface DeactivatedCollaboratorsListProps {
  collaborators: DeactivatedCollaborator[]
  onReactivate: (profileId: string) => void
}

export function DeactivatedCollaboratorsList({ 
  collaborators, 
  onReactivate 
}: DeactivatedCollaboratorsListProps) {
  const [reactivating, setReactivating] = useState<string | null>(null)

  const handleReactivate = async (profileId: string) => {
    setReactivating(profileId)
    try {
      await CollaboratorsService.reactivate(profileId)
      toast.success('Collaborateur réactivé avec succès')
      onReactivate(profileId)
    } catch (error) {
      toast.error('Erreur lors de la réactivation')
    } finally {
      setReactivating(null)
    }
  }

  if (collaborators.length === 0) {
    return null
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-orange-600">Collaborateurs désactivés</span>
          <span className="text-sm text-muted-foreground">
            ({collaborators.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
            >
              <div className="flex-1">
                <Typography variant="body" className="font-medium">
                  {collaborator.first_name} {collaborator.last_name}
                </Typography>
                <Typography variant="small" className="text-muted-foreground">
                  {collaborator.email} • {collaborator.role}
                </Typography>
                <Typography variant="small" className="text-muted-foreground">
                  Désactivé le {new Date(collaborator.deactivated_at).toLocaleDateString('fr-FR')}
                </Typography>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleReactivate(collaborator.id)}
                disabled={reactivating === collaborator.id}
                loading={reactivating === collaborator.id}
              >
                Réactiver
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
