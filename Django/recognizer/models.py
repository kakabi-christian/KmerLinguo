from django.db import models
from django.contrib.postgres.fields import ArrayField  # 👈 NOUVEAU pour PostgreSQL

class Answer(models.Model):
    id = models.UUIDField(primary_key=True)  # UUID correspond à String @id @default(uuid())
    questionId = models.UUIDField()          # correspond à questionId dans Prisma
    text = models.TextField(null=True, blank=True)  # 👈 Peut être null maintenant
    audioPath = models.TextField(null=True, blank=True)  # 👈 Chemin audio (optionnel)
    wordOptions = ArrayField(  # 👈 NOUVEAU : tableau de strings
        models.TextField(),
        default=list,  # Par défaut, liste vide
        blank=True,
    )
    isCorrect = models.BooleanField()        # vrai si c'est la bonne réponse

    class Meta:
        db_table = "Answer"  # Nom exact de la table dans PostgreSQL
        managed = False      # 👈 False car la table est gérée par Prisma

    def __str__(self):
        return f"Answer {self.id} - {self.text or 'Audio/Word Builder'}"