from django.db import models

class Answer(models.Model):
    id = models.UUIDField(primary_key=True)  # UUID correspond à String @id @default(uuid())
    questionId = models.UUIDField()         # correspond à questionId dans Prisma
    text = models.TextField()
    isCorrect = models.BooleanField()       # vrai si c'est la bonne réponse

    class Meta:
        db_table = "Answer"  # Nom exact de la table dans PostgreSQL
        managed = True         # Django ne va pas créer/modifier cette table
